import { NextResponse } from 'next/server';
import { and, asc, desc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { products, productCategories } from '@/lib/db/schema';
import { serializeProduct } from '@/lib/serialize';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const featured = searchParams.get('featured') === 'true';
  const categoryIds = searchParams.get('categoryIds')?.split(',').filter(Boolean);
  const ids = searchParams.get('ids')?.split(',').filter(Boolean);
  const sort = searchParams.get('sort') ?? 'newest';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : null;
  const pageSize = Number(searchParams.get('pageSize') ?? '12');

  if (ids && ids.length > 0) {
    const rows = await db.select().from(products).where(inArray(products.id, ids));
    return NextResponse.json({ data: rows.map((r) => serializeProduct(r)), count: rows.length });
  }

  let productIdFilter: string[] | null = null;
  if (categoryIds && categoryIds.length > 0) {
    const rows = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(inArray(productCategories.categoryId, categoryIds));
    productIdFilter = rows.map((r) => r.productId);
    if (productIdFilter.length === 0) {
      return NextResponse.json({ data: [], count: 0 });
    }
  }

  const conditions = [
    search ? ilike(products.name, `%${search}%`) : undefined,
    featured ? eq(products.isFeatured, true) : undefined,
    productIdFilter ? inArray(products.id, productIdFilter) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    sort === 'price-low'
      ? asc(products.price)
      : sort === 'price-high'
        ? desc(products.price)
        : sort === 'name'
          ? asc(products.name)
          : desc(products.createdAt);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(where);

  let query = db.select().from(products).where(where).orderBy(orderBy);
  if (page !== null) {
    query = query.limit(pageSize).offset((page - 1) * pageSize) as typeof query;
  }

  const rows = await query;
  return NextResponse.json({ data: rows.map((r) => serializeProduct(r)), count });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const categoryIds: string[] = body.category_ids ?? [];

  const [row] = await db
    .insert(products)
    .values({
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      price: String(body.price),
      originalPrice: body.original_price != null ? String(body.original_price) : null,
      categoryId: categoryIds[0] ?? null,
      imageUrl: body.image_url,
      images: body.images ?? [],
      videos: body.videos ?? [],
      isFeatured: body.is_featured ?? false,
      isNew: body.is_new ?? false,
    })
    .returning();

  if (categoryIds.length > 0) {
    await db.insert(productCategories).values(categoryIds.map((categoryId) => ({ productId: row.id, categoryId })));
  }

  return NextResponse.json(serializeProduct(row, categoryIds));
}
