import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function withMongoShape(row: any) {
  return { ...row, _id: row.id };
}

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase.from('orders').select('*', { count: 'exact' });
    if (status) query = query.eq('status', status);

    const skip = (page - 1) * limit;
    const { data: rawOrders, count, error } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);
    if (error) throw error;

    // Populate user_id (email/full_name), mirroring the old .populate() shape
    const userIds = Array.from(new Set((rawOrders || []).map((o) => o.user_id).filter(Boolean)));
    const usersById = new Map<string, any>();
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', userIds);
      (users || []).forEach((u) => usersById.set(u.id, withMongoShape(u)));
    }

    // Attach items for each order
    const orderIds = (rawOrders || []).map((o) => o.id);
    const itemsByOrder = new Map<string, any[]>();
    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      (items || []).forEach((it) => {
        const list = itemsByOrder.get(it.order_id) || [];
        list.push(it);
        itemsByOrder.set(it.order_id, list);
      });
    }

    const orders = (rawOrders || []).map((o) => ({
      ...withMongoShape(o),
      user_id: o.user_id ? usersById.get(o.user_id) || o.user_id : o.user_id,
      items: itemsByOrder.get(o.id) || [],
    }));

    const total = count || 0;
    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// POST /api/orders - Шинэ захиалга үүсгэх
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    // Attach the logged-in user (guest checkout stays supported — user_id is nullable)
    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    if (session?.user?.email) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .maybeSingle();
      userId = dbUser?.id || null;
    }

    const { items, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_district, shipping_fee: clientShippingFee, discount_code, delivery_type, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Сагс хоосон байна' }, { status: 400 });
    }

    // Validate required fields
    if (!shipping_name || !shipping_phone) {
      return NextResponse.json({ error: 'Нэр болон утасны дугаар шаардлагатай' }, { status: 400 });
    }

    // For non-pickup delivery, require address fields
    if (delivery_type !== 'pickup' && (!shipping_address || !shipping_city || !shipping_district)) {
      return NextResponse.json({ error: 'Хүргэлтийн хаяг мэдээлэл дутуу байна' }, { status: 400 });
    }

    for (const item of items) {
      if (!UUID_RE.test(item.product_id)) {
        return NextResponse.json({ error: `Буруу бараа ID: ${item.product_id}` }, { status: 400 });
      }
    }

    // Look up product total (for discount min_order / percent calculation) before creating the order
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, sale_price, stock')
      .in('id', items.map((i: any) => i.product_id));

    const productsById = new Map((products || []).map((p) => [p.id, p]));
    let total_amount = 0;
    for (const item of items) {
      const product = productsById.get(item.product_id);
      if (!product) {
        return NextResponse.json({ error: `Бараа олдсонгүй: ${item.product_id}` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `${product.name} - үлдэгдэл хүрэлцэхгүй` }, { status: 400 });
      }
      total_amount += (product.sale_price || product.price) * item.quantity;
    }

    // Apply discount
    let discount_amount = 0;
    let discountId: string | null = null;
    if (discount_code) {
      const nowIso = new Date().toISOString();
      const { data: discount } = await supabase
        .from('discounts')
        .select('*')
        .eq('code', discount_code.toUpperCase())
        .eq('is_active', true)
        .lte('start_date', nowIso)
        .gte('end_date', nowIso)
        .maybeSingle();

      if (
        discount &&
        (discount.usage_limit == null || discount.used_count < discount.usage_limit) &&
        (!discount.min_order || total_amount >= discount.min_order)
      ) {
        if (discount.type === 'percent') {
          discount_amount = total_amount * (discount.value / 100);
          if (discount.max_discount) {
            discount_amount = Math.min(discount_amount, discount.max_discount);
          }
        } else {
          discount_amount = discount.value;
        }
        discountId = discount.id;
      }
    }

    const shipping_fee = clientShippingFee || 5000;
    const order_number = `KM${Date.now().toString().slice(-8)}`;

    // Atomically create the order + order_items and decrement stock (see supabase/schema.sql)
    const { data: orderId, error: rpcError } = await supabase.rpc('create_order', {
      p_order_number: order_number,
      p_user_id: userId,
      p_items: items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity, size: i.size || null })),
      p_shipping_fee: shipping_fee,
      p_discount_amount: discount_amount,
      p_shipping_name: shipping_name,
      p_shipping_phone: shipping_phone,
      p_shipping_address: shipping_address || '',
      p_shipping_city: shipping_city || '',
      p_shipping_district: shipping_district || '',
      p_delivery_type: delivery_type || 'city',
      p_notes: notes || null,
    });

    if (rpcError) throw rpcError;

    if (discountId) {
      const { data: d } = await supabase.from('discounts').select('used_count').eq('id', discountId).maybeSingle();
      if (d) await supabase.from('discounts').update({ used_count: d.used_count + 1 }).eq('id', discountId);
    }

    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();

    return NextResponse.json(withMongoShape(order), { status: 201 });
  } catch (error: any) {
    console.error('Orders POST error:', error);
    return NextResponse.json({
      error: 'Алдаа гарлаа',
      details: error.message
    }, { status: 500 });
  }
}
