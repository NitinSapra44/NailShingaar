import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { orders, orderItems } from '@/lib/db/schema';
import { serializeOrder } from '@/lib/serialize';
import { requireUser } from '@/lib/api-auth';

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const wantAll = searchParams.get('all') === 'true';

  const rows =
    wantAll && user.role === 'admin'
      ? await db.select().from(orders).orderBy(desc(orders.createdAt))
      : await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));

  return NextResponse.json(rows.map((r) => serializeOrder(r)));
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { order, items } = await request.json();

  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(orders)
      .values({
        userId: user.id,
        status: 'pending',
        total: String(order.total ?? 0),
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingPhone: order.shipping_phone,
        shippingName: order.shipping_name,
        nailLength: order.nail_length ?? null,
        nailShape: order.nail_shape ?? null,
        colorPreference: order.color_preference ?? null,
        nailPhotos: order.nail_photos ?? [],
        paymentScreenshot: order.payment_screenshot ?? null,
        paymentStatus: order.payment_status ?? 'pending',
        notes: order.notes ?? null,
      })
      .returning();

    let createdItems: (typeof orderItems.$inferSelect)[] = [];
    if (Array.isArray(items) && items.length > 0) {
      createdItems = await tx
        .insert(orderItems)
        .values(
          items.map((item: Record<string, unknown>) => ({
            orderId: row.id,
            productId: (item.product_id as string) ?? null,
            productName: item.product_name as string,
            productImage: (item.product_image as string) ?? null,
            size: item.size as string,
            quantity: item.quantity as number,
            price: String(item.price),
          }))
        )
        .returning();
    }

    return { row, createdItems };
  });

  return NextResponse.json(serializeOrder(created.row, created.createdItems));
}
