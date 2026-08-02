import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }
    if (!(await requireAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();
    // _id (frontend's Mongo-shaped alias for id) isn't a real column — drop it so it
    // doesn't get forwarded into the update payload.
    const { _id, ...updateData } = body;

    const { data: product, error } = await supabase
      .from('products')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !product) {
      console.error('Product PUT error:', error);
      return NextResponse.json({ error: error?.message || 'Бараа олдсонгүй' }, { status: error ? 500 : 404 });
    }

    return NextResponse.json(withMongoShape(product));
  } catch (error: any) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: error?.message || 'Алдаа гарлаа' }, { status: 500 });
  }
}

// DELETE /api/products/[id] (Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }
    if (!(await requireAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

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
