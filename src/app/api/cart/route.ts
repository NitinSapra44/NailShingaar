import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { cartItems, products } from '@/lib/db/schema';
import { serializeProduct } from '@/lib/serialize';
import { requireUser } from '@/lib/api-auth';

function serializeCartItem(row: typeof cartItems.$inferSelect, product?: typeof products.$inferSelect) {
  return {
    id: row.id,
    user_id: row.userId,
    product_id: row.productId,
    size: row.size,
    quantity: row.quantity,
    created_at: row.createdAt.toISOString(),
    product: product ? serializeProduct(product) : undefined,
  };
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db
    .select({ cart: cartItems, product: products })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, user.id));

  return NextResponse.json(rows.map((r) => serializeCartItem(r.cart, r.product ?? undefined)));
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id, size, quantity } = await request.json();

  await db
    .insert(cartItems)
    .values({ userId: user.id, productId: product_id, size, quantity: quantity ?? 1 })
    .onConflictDoUpdate({
      target: [cartItems.userId, cartItems.productId, cartItems.size],
      set: { quantity: quantity ?? 1 },
    });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id, size, quantity } = await request.json();

  await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, product_id), eq(cartItems.size, size)));

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');
  const size = searchParams.get('size');

  if (productId && size) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId), eq(cartItems.size, size)));
  } else {
    // No product/size given — clear the whole cart.
    await db.delete(cartItems).where(eq(cartItems.userId, user.id));
  }

  return NextResponse.json({ success: true });
}
