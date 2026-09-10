import { NextResponse } from 'next/server';
import { desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { products, categories, orders } from '@/lib/db/schema';
import { serializeOrder } from '@/lib/serialize';
import { requireAdmin } from '@/lib/api-auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [[{ count: productCount }], [{ count: categoryCount }], allOrders, recentOrders] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(products),
    db.select({ count: sql<number>`count(*)::int` }).from(categories),
    db.select({ total: orders.total }).from(orders),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
  ]);

  const revenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);

  return NextResponse.json({
    products: productCount,
    categories: categoryCount,
    orders: allOrders.length,
    revenue,
    recentOrders: recentOrders.map((r) => serializeOrder(r)),
  });
}
