import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { categories } from '@/lib/db/schema';
import { serializeCategory } from '@/lib/serialize';
import { requireAdmin } from '@/lib/api-auth';

export async function GET() {
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return NextResponse.json(rows.map(serializeCategory));
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const [row] = await db
    .insert(categories)
    .values({
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      imageUrl: body.image_url ?? null,
    })
    .returning();

  return NextResponse.json(serializeCategory(row));
}
