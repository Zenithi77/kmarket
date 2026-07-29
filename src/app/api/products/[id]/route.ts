import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function withMongoShape(row: any) {
  return { ...row, _id: row.id };
}

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    // Check if id is a UUID or a slug
    const isId = UUID_RE.test(id);
    const query = supabase.from('products').select('*');
    const { data: product } = isId
      ? await query.eq('id', id).maybeSingle()
      : await query.eq('slug', id).maybeSingle();

    if (!product) {
      return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 });
    }

    // Populate category_id (name/slug only), mirroring the old .populate() shape
    if (product.category_id) {
      const { data: category } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', product.category_id)
        .maybeSingle();
      if (category) {
        (product as any).category_id = withMongoShape(category);
      }
    }

    return NextResponse.json(withMongoShape(product));
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// PUT /api/products/[id] (Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const { data: product, error } = await supabase
      .from('products')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !product) {
      return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(withMongoShape(product));
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// DELETE /api/products/[id] (Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { data: product } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Амжилттай устгалаа' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
