import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { blogPosts } from '@/lib/db/schema';
import { serializeBlogPost } from '@/lib/serialize';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get('published') === 'true';
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

  let query = db
    .select()
    .from(blogPosts)
    .where(publishedOnly ? eq(blogPosts.published, true) : undefined)
    .orderBy(desc(blogPosts.createdAt));

  if (limit) query = query.limit(limit) as typeof query;

  const rows = await query;
  return NextResponse.json(rows.map(serializeBlogPost));
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const [row] = await db
    .insert(blogPosts)
    .values({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt ?? null,
      content: body.content ?? null,
      coverImageUrl: body.cover_image_url ?? null,
      metaDescription: body.meta_description ?? null,
      published: body.published ?? false,
    })
    .returning();

  return NextResponse.json(serializeBlogPost(row));
}
