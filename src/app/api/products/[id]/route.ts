import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/lib/models';

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check if id is slug or ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(params.id);
    const query = isObjectId ? { _id: params.id } : { slug: params.id };

    const product = await Product.findOne(query)
      .populate('category_id', 'name slug')
      .lean();

    if (!product) {
      return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// PUT /api/products/[id] (Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();

    const product = await Product.findByIdAndUpdate(
      params.id,
      { ...body, updated_at: new Date() },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// DELETE /api/products/[id] (Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Амжилттай устгалаа' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
