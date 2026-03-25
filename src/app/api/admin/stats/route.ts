import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order, Product, User, Category } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ---- Core Stats ----
    const [\ ,
      totalOrders,
      totalProducts,
      totalUsers,
      ordersThisMonth,
      ordersLastMonth,
      usersThisMonth,
      usersLastMonth,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ is_active: true }),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments({ created_at: { $gte: startOfMonth } }),
      Order.countDocuments({ created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      User.countDocuments({ role: 'user', created_at: { $gte: startOfMonth } }),
      User.countDocuments({ role: 'user', created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    // Revenue aggregation - this month
    const revenueThisMonthAgg = await Order.aggregate([
      { $match: { created_at: { $gte: startOfMonth }, payment_status: { $in: ['paid'] } } },
      { $group: { _id: null, total: { $sum: '$final_amount' } } },
    ]);
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;

    // Revenue aggregation - last month
    const revenueLastMonthAgg = await Order.aggregate([
      { $match: { created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth }, payment_status: { $in: ['paid'] } } },
      { $group: { _id: null, total: { $sum: '$final_amount' } } },
    ]);
    const revenueLastMonth = revenueLastMonthAgg[0]?.total || 0;

    // Total revenue (all time, paid orders)
    const totalRevenueAgg = await Order.aggregate([
      { $match: { payment_status: { $in: ['paid'] } } },
      { $group: { _id: null, total: { $sum: '$final_amount' } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Calculate percentage changes
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    const revenueChange = calcChange(revenueThisMonth, revenueLastMonth);
    const ordersChange = calcChange(ordersThisMonth, ordersLastMonth);
    const usersChange = calcChange(usersThisMonth, usersLastMonth);

    // ---- Recent Orders (last 10) ----
    const recentOrders = await Order.find()
      .populate('user_id', 'full_name email')
      .sort({ created_at: -1 })
      .limit(10)
      .lean();

    const formattedOrders = recentOrders.map((order: any) => ({
      id: order.order_number,
      customer: order.user_id?.full_name || order.shipping_name || 'Зочин',
      total: order.final_amount,
      status: order.status,
      payment_status: order.payment_status,
      date: order.created_at,
    }));

    // ---- Top Products by sales ----
    const topProductsAgg = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product_id',
          name: { $first: '$items.name' },
          sold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]);

    // ---- Monthly Revenue (last 6 months) ----
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRevenueAgg = await Order.aggregate([
      { $match: { created_at: { $gte: sixMonthsAgo }, payment_status: { $in: ['paid'] } } },
      {
        $group: {
          _id: { year: { $year: '$created_at' }, month: { $month: '$created_at' } },
          revenue: { $sum: '$final_amount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
    const monthlyData = monthlyRevenueAgg.map((item: any) => ({
      month: monthNames[item._id.month - 1],
      revenue: item.revenue,
      orders: item.orders,
    }));

    // ---- Top Categories ----
    const topCategoriesAgg = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$category._id',
          name: { $first: '$category.name' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Calculate percentages for categories
    const totalCategoryRevenue = topCategoriesAgg.reduce((sum: number, c: any) => sum + c.revenue, 0);
    const topCategories = topCategoriesAgg.map((cat: any) => ({
      name: cat.name || 'Тодорхойгүй',
      revenue: cat.revenue,
      percentage: totalCategoryRevenue > 0 ? Math.round((cat.revenue / totalCategoryRevenue) * 100) : 0,
    }));

    return NextResponse.json({
      stats: {
        totalRevenue,
        revenueChange,
        totalOrders,
        ordersChange,
        totalProducts,
        totalUsers,
        usersChange,
      },
      recentOrders: formattedOrders,
      topProducts: topProductsAgg,
      monthlyData,
      topCategories,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
