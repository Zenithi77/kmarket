import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function withMongoShape(row: any) {
  return { ...row, _id: row.id };
}

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    // Find by id or order_number
    const isId = UUID_RE.test(id);
    const base = supabase.from('orders').select('*');
    const { data: order } = isId
      ? await base.eq('id', id).maybeSingle()
      : await base.eq('order_number', id).maybeSingle();

    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }

    // Populate user_id (email/full_name/phone)
    if (order.user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, full_name, phone')
        .eq('id', order.user_id)
        .maybeSingle();
      if (user) (order as any).user_id = withMongoShape(user);
    }

    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    (order as any).items = items || [];

    return NextResponse.json(withMongoShape(order));
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const body = await request.json();

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: body.status,
        payment_status: body.payment_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(withMongoShape(order));
  } catch (error) {
    console.error('Order PUT error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
