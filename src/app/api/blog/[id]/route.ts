import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { blogPosts } from '@/lib/db/schema';
import { serializeBlogPost } from '@/lib/serialize';
import { requireAdmin } from '@/lib/api-auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const [row] = await db
    .update(blogPosts)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.cover_image_url !== undefined && { coverImageUrl: body.cover_image_url }),
      ...(body.meta_description !== undefined && { metaDescription: body.meta_description }),
      ...(body.published !== undefined && { published: body.published }),
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(serializeBlogPost(row));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  return NextResponse.json({ success: true });
}
