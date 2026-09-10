import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { products, productCategories } from '@/lib/db/schema';
import { serializeProduct } from '@/lib/serialize';
import { requireAdmin } from '@/lib/api-auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const categoryIds: string[] | undefined = body.category_ids;

  const [row] = await db
    .update(products)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: String(body.price) }),
      ...(body.original_price !== undefined && {
        originalPrice: body.original_price != null ? String(body.original_price) : null,
      }),
      ...(categoryIds !== undefined && { categoryId: categoryIds[0] ?? null }),
      ...(body.image_url !== undefined && { imageUrl: body.image_url }),
      ...(body.images !== undefined && { images: body.images }),
      ...(body.videos !== undefined && { videos: body.videos }),
      ...(body.stock !== undefined && { stock: body.stock }),
      ...(body.is_featured !== undefined && { isFeatured: body.is_featured }),
      ...(body.is_new !== undefined && { isNew: body.is_new }),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (categoryIds !== undefined) {
    await db.delete(productCategories).where(eq(productCategories.productId, id));
    if (categoryIds.length > 0) {
      await db.insert(productCategories).values(categoryIds.map((categoryId) => ({ productId: id, categoryId })));
    }
  }

  return NextResponse.json(serializeProduct(row, categoryIds));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ success: true });
}
