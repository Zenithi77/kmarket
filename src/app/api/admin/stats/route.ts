import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const count = async (
      table: string,
      apply: (q: any) => any
    ): Promise<number> => {
      const { count } = await apply(supabase.from(table).select('id', { count: 'exact', head: true }));
      return count || 0;
    };

    // ---- Core Stats ----
    const [totalOrders, totalProducts, totalUsers, ordersThisMonth, ordersLastMonth, usersThisMonth, usersLastMonth] =
      await Promise.all([
        count('orders', (q) => q),
        count('products', (q) => q.eq('is_active', true)),
        count('users', (q) => q.eq('role', 'user')),
        count('orders', (q) => q.gte('created_at', startOfMonth.toISOString())),
        count('orders', (q) =>
          q.gte('created_at', startOfLastMonth.toISOString()).lte('created_at', endOfLastMonth.toISOString())
        ),
        count('users', (q) => q.eq('role', 'user').gte('created_at', startOfMonth.toISOString())),
        count('users', (q) =>
          q
            .eq('role', 'user')
            .gte('created_at', startOfLastMonth.toISOString())
            .lte('created_at', endOfLastMonth.toISOString())
        ),
      ]);

    const sumFinalAmount = async (apply: (q: any) => any): Promise<number> => {
      const { data } = await apply(supabase.from('orders').select('final_amount').eq('payment_status', 'paid'));
      return (data || []).reduce((sum: number, o: any) => sum + Number(o.final_amount), 0);
    };

    const [revenueThisMonth, revenueLastMonth, totalRevenue] = await Promise.all([
      sumFinalAmount((q: any) => q.gte('created_at', startOfMonth.toISOString())),
      sumFinalAmount((q: any) =>
        q.gte('created_at', startOfLastMonth.toISOString()).lte('created_at', endOfLastMonth.toISOString())
      ),
      sumFinalAmount((q: any) => q),
    ]);

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    const revenueChange = calcChange(revenueThisMonth, revenueLastMonth);
    const ordersChange = calcChange(ordersThisMonth, ordersLastMonth);
    const usersChange = calcChange(usersThisMonth, usersLastMonth);

    // ---- Recent Orders (last 10) ----
    const { data: recentOrdersRaw } = await supabase
      .from('orders')
      .select('order_number, user_id, shipping_name, final_amount, status, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    const recentUserIds = Array.from(new Set((recentOrdersRaw || []).map((o) => o.user_id).filter(Boolean)));
    const recentUsersById = new Map<string, any>();
    if (recentUserIds.length > 0) {
      const { data: recentUsers } = await supabase.from('users').select('id, full_name, email').in('id', recentUserIds);
      (recentUsers || []).forEach((u) => recentUsersById.set(u.id, u));
    }

    const formattedOrders = (recentOrdersRaw || []).map((order: any) => ({
      id: order.order_number,
      customer: recentUsersById.get(order.user_id)?.full_name || order.shipping_name || 'Зочин',
      total: order.final_amount,
      status: order.status,
      payment_status: order.payment_status,
      date: order.created_at,
    }));

    // ---- Top Products by sales (all-time, across all order items) ----
    const { data: allItems } = await supabase.from('order_items').select('product_id, name, price, quantity');
    const productAgg = new Map<string, { name: string; sold: number; revenue: number }>();
    (allItems || []).forEach((item: any) => {
      const entry = productAgg.get(item.product_id) || { name: item.name, sold: 0, revenue: 0 };
      entry.sold += item.quantity;
      entry.revenue += item.price * item.quantity;
      productAgg.set(item.product_id, entry);
    });
    const topProducts = Array.from(productAgg.entries())
      .map(([_id, v]) => ({ _id, ...v }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // ---- Monthly Revenue (last 6 months) ----
    const { data: recentPaidOrders } = await supabase
      .from('orders')
      .select('final_amount, created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', sixMonthsAgo.toISOString());

    const monthNames = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
    const monthlyAgg = new Map<string, { year: number; month: number; revenue: number; orders: number }>();
    (recentPaidOrders || []).forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = monthlyAgg.get(key) || { year: d.getFullYear(), month: d.getMonth(), revenue: 0, orders: 0 };
      entry.revenue += Number(o.final_amount);
      entry.orders += 1;
      monthlyAgg.set(key, entry);
    });
    const monthlyData = Array.from(monthlyAgg.values())
      .sort((a, b) => (a.year - b.year) || (a.month - b.month))
      .map((item) => ({ month: monthNames[item.month], revenue: item.revenue, orders: item.orders }));

    // ---- Top Categories (by revenue, across all order items) ----
    const productIds = Array.from(new Set((allItems || []).map((i: any) => i.product_id)));
    const productCategoryById = new Map<string, string | null>();
    if (productIds.length > 0) {
      const { data: productRows } = await supabase.from('products').select('id, category_id').in('id', productIds);
      (productRows || []).forEach((p: any) => productCategoryById.set(p.id, p.category_id));
    }
    const categoryIds = Array.from(new Set(Array.from(productCategoryById.values()).filter(Boolean))) as string[];
    const categoryNameById = new Map<string, string>();
    if (categoryIds.length > 0) {
      const { data: categoryRows } = await supabase.from('categories').select('id, name').in('id', categoryIds);
      (categoryRows || []).forEach((c: any) => categoryNameById.set(c.id, c.name));
    }

    const categoryRevenue = new Map<string, number>();
    (allItems || []).forEach((item: any) => {
      const categoryId = productCategoryById.get(item.product_id);
      if (!categoryId) return;
      categoryRevenue.set(categoryId, (categoryRevenue.get(categoryId) || 0) + item.price * item.quantity);
    });

    const totalCategoryRevenue = Array.from(categoryRevenue.values()).reduce((sum, r) => sum + r, 0);
    const topCategories = Array.from(categoryRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoryId, revenue]) => ({
        name: categoryNameById.get(categoryId) || 'Тодорхойгүй',
        revenue,
        percentage: totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 100) : 0,
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
      topProducts,
      monthlyData,
      topCategories,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
