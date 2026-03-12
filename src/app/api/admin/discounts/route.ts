import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/lib/models';

// GET /api/admin/discounts - Get all products with discount info
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const filter = searchParams.get('filter'); // 'all' | 'on_sale' | 'no_sale'
    const category = searchParams.get('category');

    const query: any = { is_active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category_id = category;
    }

    if (filter === 'on_sale') {
      query.sale_price = { $exists: true, $ne: null, $gt: 0 };
    } else if (filter === 'no_sale') {
      query.$or = [
        { sale_price: { $exists: false } },
        { sale_price: null },
        { sale_price: 0 },
      ];
      // If search is also set, we need $and
      if (search) {
        query.$and = [
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { brand: { $regex: search, $options: 'i' } },
            ],
          },
          {
            $or: [
              { sale_price: { $exists: false } },
              { sale_price: null },
              { sale_price: 0 },
            ],
          },
        ];
        delete query.$or;
      }
    }

    const products = await Product.find(query)
      .populate('category_id', 'name slug')
      .sort({ updated_at: -1 })
      .select('name slug price sale_price images stock category_id brand')
      .lean();

    // Get stats
    const allProducts = await Product.countDocuments({ is_active: true });
    const onSaleProducts = await Product.countDocuments({
      is_active: true,
      sale_price: { $exists: true, $ne: null, $gt: 0 },
    });

    return NextResponse.json({
      products,
      stats: {
        total: allProducts,
        onSale: onSaleProducts,
        noSale: allProducts - onSaleProducts,
      },
    });
  } catch (error) {
    console.error('Admin discounts GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// PUT /api/admin/discounts - Bulk update sale prices
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // body.updates: Array of { productId: string, salePrice: number | null }
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'updates массив шаардлагатай' }, { status: 400 });
    }

    const bulkOps = updates.map((update: { productId: string; salePrice: number | null }) => {
      if (update.salePrice && update.salePrice > 0) {
        return {
          updateOne: {
            filter: { _id: update.productId },
            update: {
              $set: { sale_price: update.salePrice, updated_at: new Date() },
            },
          },
        };
      }
      return {
        updateOne: {
          filter: { _id: update.productId },
          update: {
            $unset: { sale_price: '' as any },
            $set: { updated_at: new Date() },
          },
        },
      };
    });

    const result = await (Product as any).bulkWrite(bulkOps);

    return NextResponse.json({
      message: 'Хямдрал амжилттай шинэчлэгдлээ',
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error('Admin discounts PUT error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
