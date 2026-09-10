import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { wishlist, products } from '@/lib/db/schema';
import { serializeProduct } from '@/lib/serialize';
import { requireUser } from '@/lib/api-auth';

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db
    .select({ productId: wishlist.productId, product: products })
    .from(wishlist)
    .leftJoin(products, eq(wishlist.productId, products.id))
    .where(eq(wishlist.userId, user.id));

  return NextResponse.json(
    rows.map((r) => ({ product_id: r.productId, product: r.product ? serializeProduct(r.product) : undefined }))
  );
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id } = await request.json();

  await db
    .insert(wishlist)
    .values({ userId: user.id, productId: product_id })
    .onConflictDoNothing({ target: [wishlist.userId, wishlist.productId] });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');
  if (!productId) return NextResponse.json({ error: 'product_id is required' }, { status: 400 });

  await db.delete(wishlist).where(and(eq(wishlist.userId, user.id), eq(wishlist.productId, productId)));
  return NextResponse.json({ success: true });
}
