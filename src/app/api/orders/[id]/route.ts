import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/lib/models';

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Find by id or order_number
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(params.id);
    const query = isObjectId ? { _id: params.id } : { order_number: params.id };

    const order = await Order.findOne(query)
      .populate('user_id', 'email full_name phone')
      .lean();

    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();

    const order = await Order.findByIdAndUpdate(
      params.id,
      { 
        status: body.status,
        payment_status: body.payment_status,
        updated_at: new Date() 
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order PUT error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
