import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { categories } from '@/lib/db/schema';
import { serializeCategory } from '@/lib/serialize';
import { requireAdmin } from '@/lib/api-auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const [row] = await db
    .update(categories)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.image_url !== undefined && { imageUrl: body.image_url }),
    })
    .where(eq(categories.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(serializeCategory(row));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ success: true });
}
