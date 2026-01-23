import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/lib/models';

// POST /api/payment/webhook - Bank SMS webhook
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Parse SMS content for payment info
    // Example format: "KM12345678 100000 MNT Khan Bank"
    const { sms_content, sender } = body;

    // Extract order number from SMS
    const orderMatch = sms_content.match(/KM\d{8}/i);
    if (!orderMatch) {
      return NextResponse.json({ error: 'Захиалгын дугаар олдсонгүй' }, { status: 400 });
    }

    const orderNumber = orderMatch[0].toUpperCase();

    // Find and update order
    const order = await Order.findOneAndUpdate(
      { order_number: orderNumber, payment_status: 'pending' },
      { 
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй эсвэл төлбөр төлөгдсөн' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Төлбөр баталгаажлаа',
      order_number: order.order_number,
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// GET /api/payment/check/[orderId] - Check payment status
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'Захиалгын ID шаардлагатай' }, { status: 400 });
    }

    const order = await Order.findById(orderId).select('payment_status status order_number').lean();

    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({
      paid: order.payment_status === 'paid',
      payment_status: order.payment_status,
      status: order.status,
      order_number: order.order_number,
    });
  } catch (error) {
    console.error('Payment check error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
