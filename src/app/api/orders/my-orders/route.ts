import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Order, User } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Хэрэглэгч олдсонгүй' },
        { status: 404 }
      );
    }

    // Find orders for this user
    const orders = await Order.find({ user_id: user._id })
      .sort({ created_at: -1 })
      .lean();

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      _id: order._id.toString(),
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || null,
      })),
      total: order.total_amount,
      status: order.status,
      paymentRef: order.payment_ref || order._id.toString().slice(-8).toUpperCase(),
      delivery: order.delivery_type || 'city',
      address: order.shipping_address || '',
      createdAt: order.created_at,
      deliveredAt: order.delivered_at || null,
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
