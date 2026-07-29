import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

// Mongo responses exposed `_id` everywhere; keep the frontend contract identical.
function withMongoShape(row: any) {
  return { ...row, _id: row.id };
}

async function requireAdmin(email: string) {
  const supabase = getSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .maybeSingle();
  return user?.role === 'admin';
}

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    const { searchParams } = new URL(request.url);
    const parentSlug = searchParams.get('parent');
    const flat = searchParams.get('flat') === 'true';

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    const categories = (data || []).map(withMongoShape);

    // If requesting flat list (for dropdowns)
    if (flat) {
      return NextResponse.json(categories);
    }

    // If requesting subcategories of a specific parent
    if (parentSlug) {
      const parent = categories.find((c) => c.slug === parentSlug && !c.parent_id);
      if (!parent) {
        return NextResponse.json([]);
      }
      const subs = categories.filter((c) => c.parent_id === parent._id);
      return NextResponse.json(subs);
    }

    // Default: organize into parent/child structure
    const parents = categories.filter((c) => !c.parent_id);
    const result = parents.map((parent) => ({
      ...parent,
      subcategories: categories.filter((c) => c.parent_id === parent._id),
    }));

    return NextResponse.json(result, {
      headers: {
        // Edge-cache for 1 hour, serve stale up to 1 day while revalidating
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// POST /api/categories (Admin)
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

    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Энэ slug аль хэдийн байна' }, { status: 400 });
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: body.name,
        slug,
        icon: body.icon,
        image: body.image,
        parent_id: body.parent_id || null,
        filters: body.filters || [],
        order: body.order || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(withMongoShape(category), { status: 201 });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// PUT /api/categories (Admin) - Update category
export async function PUT(request: NextRequest) {
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
    const { _id, id, ...updateData } = body;
    const categoryId = _id || id;

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .maybeSingle();

    if (error || !category) {
      return NextResponse.json({ error: 'Категори олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(withMongoShape(category));
  } catch (error) {
    console.error('Categories PUT error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// DELETE /api/categories (Admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    if (!(await requireAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID шаардлагатай' }, { status: 400 });
    }

    // Also delete subcategories
    await supabase.from('categories').delete().eq('parent_id', id);
    await supabase.from('categories').delete().eq('id', id);

    return NextResponse.json({ message: 'Устгагдлаа' });
  } catch (error) {
    console.error('Categories DELETE error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
