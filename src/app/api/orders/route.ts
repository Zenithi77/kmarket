import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order, Product, Discount } from '@/lib/models';

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user_id', 'email full_name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

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
    await connectDB();
    const body = await request.json();

    const { items, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_district, discount_code, notes } = body;

    // Calculate totals
    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return NextResponse.json({ error: `Бараа олдсонгүй: ${item.product_id}` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `${product.name} - үлдэгдэл хүрэлцэхгүй` }, { status: 400 });
      }

      const price = product.sale_price || product.price;
      total_amount += price * item.quantity;

      orderItems.push({
        product_id: product._id,
        name: product.name,
        image: product.images[0],
        price,
        quantity: item.quantity,
        size: item.size,
      });

      // Reduce stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Apply discount
    let discount_amount = 0;
    if (discount_code) {
      const discount = await Discount.findOne({
        code: discount_code.toUpperCase(),
        is_active: true,
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
        $or: [
          { usage_limit: null },
          { $expr: { $lt: ['$used_count', '$usage_limit'] } },
        ],
      });

      if (discount && (!discount.min_order || total_amount >= discount.min_order)) {
        if (discount.type === 'percent') {
          discount_amount = total_amount * (discount.value / 100);
          if (discount.max_discount) {
            discount_amount = Math.min(discount_amount, discount.max_discount);
          }
        } else {
          discount_amount = discount.value;
        }

        // Increment used count
        await Discount.findByIdAndUpdate(discount._id, {
          $inc: { used_count: 1 },
        });
      }
    }

    const shipping_fee = 5000;
    const final_amount = total_amount + shipping_fee - discount_amount;

    // Generate order number
    const order_number = `KM${Date.now().toString().slice(-8)}`;

    const order = await Order.create({
      order_number,
      items: orderItems,
      total_amount,
      shipping_fee,
      discount_amount,
      final_amount,
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_district,
      notes,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
