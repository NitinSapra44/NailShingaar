import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { products } from '@/lib/db/schema';
import { serializeProduct } from '@/lib/serialize';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!row) return NextResponse.json(null);
  return NextResponse.json(serializeProduct(row));
}
