import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireAdmin(email: string) {
  const supabase = getSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .maybeSingle();
  return user?.role === 'admin';
}

async function resolveCategoryId(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (UUID_RE.test(value)) return value;
  const supabase = getSupabase();
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', value)
    .maybeSingle();
  return cat ? cat.id : '__NOMATCH__';
}

function withMongoShape(row: any) {
  return { ...row, _id: row.id };
}

// Attaches populated category_id/subcategory_id objects, mirroring the old Mongoose
// .populate() shape the frontend's mapProduct() already knows how to read.
async function attachCategories(products: any[]) {
  const supabase = getSupabase();
  const ids = Array.from(
    new Set(products.flatMap((p) => [p.category_id, p.subcategory_id]).filter(Boolean))
  );
  if (ids.length === 0) return products;

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, filters')
    .in('id', ids);

  const byId = new Map((categories || []).map((c) => [c.id, withMongoShape(c)]));

  return products.map((p) => ({
    ...p,
    category_id: p.category_id ? byId.get(p.category_id) || p.category_id : p.category_id,
    subcategory_id: p.subcategory_id ? byId.get(p.subcategory_id) || p.subcategory_id : p.subcategory_id,
  }));
}

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const isNew = searchParams.get('new');
    const sale = searchParams.get('sale');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const brand = searchParams.get('brand');
    const color = searchParams.get('color');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Attribute-based filters (passed as attr_KEY=VALUE)
    const attrFilters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('attr_')) {
        attrFilters[key.replace('attr_', '')] = value;
      }
    });

    const sizeFilter = searchParams.get('size');

    // Resolve category/subcategory by slug or id
    const [categoryId, subcategoryId] = await Promise.all([
      resolveCategoryId(category),
      resolveCategoryId(subcategory),
    ]);

    if (categoryId === '__NOMATCH__' || subcategoryId === '__NOMATCH__') {
      return NextResponse.json({
        products: [],
        pagination: { page, limit, total: 0, pages: 0 },
      });
    }

    let query = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);

    if (categoryId) query = query.eq('category_id', categoryId);
    if (subcategoryId) query = query.eq('subcategory_id', subcategoryId);
    if (brand) query = query.eq('brand', brand);
    if (featured === 'true') query = query.eq('is_featured', true);
    if (isNew === 'true') query = query.eq('is_new', true);
    if (sale === 'true') query = query.not('sale_price', 'is', null);

    if (search) {
      const escaped = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `name.ilike.%${escaped}%,description.ilike.%${escaped}%,brand.ilike.%${escaped}%`
      );
    }

    if (minPrice) query = query.gte('price', parseInt(minPrice));
    if (maxPrice) query = query.lte('price', parseInt(maxPrice));

    if (sizeFilter) query = query.contains('sizes', [sizeFilter]);

    for (const [key, value] of Object.entries(attrFilters)) {
      query = query.eq(`attributes->>${key}`, value);
    }

    const skip = (page - 1) * limit;
    query = query.order(sort, { ascending: order === 'asc' }).range(skip, skip + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    let products = data || [];

    // Color filter (jsonb array of {name,hex} — matched case-insensitively in JS,
    // since PostgREST has no case-insensitive containment operator for jsonb arrays)
    if (color) {
      products = products.filter((p: any) =>
        Array.isArray(p.colors) && p.colors.some((c: any) => c.name?.toLowerCase() === color.toLowerCase())
      );
    }

    products = await attachCategories(products);
    products = products.map(withMongoShape);

    const total = count || 0;
    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// POST /api/products (Admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }
    if (!(await requireAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const supabase = getSupabase();
    const body = await request.json();

    if (!body.name || !body.price || !body.category_id) {
      return NextResponse.json(
        { error: 'Барааны нэр, үнэ, ангилал заавал шаардлагатай' },
        { status: 400 }
      );
    }

    // Cyrillic-only names strip down to an empty string here (no a-z0-9 survives),
    // so fall back to a plain timestamp slug rather than inserting an empty/invalid one.
    const generatedSlug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = body.slug || (generatedSlug ? `${generatedSlug}-${Date.now()}` : `product-${Date.now()}`);

    const { data: product, error } = await supabase
      .from('products')
      .insert({ ...body, slug })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(withMongoShape(product), { status: 201 });
  } catch (error: any) {
    console.error('Products POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}
