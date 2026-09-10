import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { productCategories } from '@/lib/db/schema';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, id));

  return NextResponse.json(rows.map((r) => r.categoryId));
}
