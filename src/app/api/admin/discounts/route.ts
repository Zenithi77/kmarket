import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function withMongoShape(row: any) {
  return { ...row, _id: row.id };
}

// GET /api/admin/discounts - Get all products with discount info
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const filter = searchParams.get('filter'); // 'all' | 'on_sale' | 'no_sale'
    const category = searchParams.get('category');

    let query = supabase
      .from('products')
      .select('id, name, slug, price, sale_price, images, stock, category_id, brand')
      .eq('is_active', true);

    if (category) query = query.eq('category_id', category);

    if (search) {
      const escaped = search.replace(/[%_]/g, '\\$&');
      query = query.or(`name.ilike.%${escaped}%,brand.ilike.%${escaped}%`);
    }

    if (filter === 'on_sale') {
      query = query.not('sale_price', 'is', null).gt('sale_price', 0);
    } else if (filter === 'no_sale') {
      query = query.or('sale_price.is.null,sale_price.eq.0');
    }

    const { data: rawProducts, error } = await query.order('updated_at', { ascending: false });
    if (error) throw error;

    // Populate category_id (name/slug), mirroring the old .populate() shape
    const categoryIds = Array.from(new Set((rawProducts || []).map((p) => p.category_id).filter(Boolean)));
    const categoriesById = new Map<string, any>();
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .in('id', categoryIds);
      (categories || []).forEach((c) => categoriesById.set(c.id, withMongoShape(c)));
    }

    const products = (rawProducts || []).map((p) => ({
      ...withMongoShape(p),
      category_id: p.category_id ? categoriesById.get(p.category_id) || p.category_id : p.category_id,
    }));

    // Get stats
    const { count: allProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    const { count: onSaleProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('sale_price', 'is', null)
      .gt('sale_price', 0);

    const total = allProducts || 0;
    const onSale = onSaleProducts || 0;

    return NextResponse.json({
      products,
      stats: {
        total,
        onSale,
        noSale: total - onSale,
      },
    });
  } catch (error) {
    console.error('Admin discounts GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// PUT /api/admin/discounts - Bulk update sale prices
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    // body.updates: Array of { productId: string, salePrice: number | null }
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'updates массив шаардлагатай' }, { status: 400 });
    }

    let modified = 0;
    for (const update of updates as { productId: string; salePrice: number | null }[]) {
      const salePrice = update.salePrice && update.salePrice > 0 ? update.salePrice : null;
      const { error } = await supabase
        .from('products')
        .update({ sale_price: salePrice, updated_at: new Date().toISOString() })
        .eq('id', update.productId);
      if (!error) modified++;
    }

    return NextResponse.json({
      message: 'Хямдрал амжилттай шинэчлэгдлээ',
      modified,
    });
  } catch (error) {
    console.error('Admin discounts PUT error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
