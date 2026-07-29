import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const supabase = getSupabase();

    // Find user by email
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { error: 'Хэрэглэгч олдсонгүй' },
        { status: 404 }
      );
    }

    // Find orders for this user
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Attach items for each order
    const orderIds = (orders || []).map((o) => o.id);
    const itemsByOrder = new Map<string, any[]>();
    if (orderIds.length > 0) {
      const { data: items } = await supabase.from('order_items').select('*').in('order_id', orderIds);
      (items || []).forEach((it) => {
        const list = itemsByOrder.get(it.order_id) || [];
        list.push(it);
        itemsByOrder.set(it.order_id, list);
      });
    }

    // Format orders for frontend
    const formattedOrders = (orders || []).map((order) => ({
      _id: order.id,
      items: (itemsByOrder.get(order.id) || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || null,
      })),
      total: order.final_amount,
      status: order.status === 'pending' ? 'Pending' :
              order.status === 'confirmed' ? 'Processing' :
              order.status === 'processing' ? 'Processing' :
              order.status === 'shipped' ? 'Shipped' :
              order.status === 'delivered' ? 'Delivered' :
              order.status === 'cancelled' ? 'Cancelled' : order.status,
      paymentRef: order.order_number,
      delivery: 'city',
      address: `${order.shipping_address}, ${order.shipping_district}, ${order.shipping_city}`,
      createdAt: order.created_at,
      deliveredAt: null,
    }));

    return NextResponse.json({
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('My orders GET error:', error);
    return NextResponse.json(
      { error: 'Серверийн алдаа' },
      { status: 500 }
    );
  }
}
