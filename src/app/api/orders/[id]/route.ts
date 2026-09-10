import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { orders, orderItems } from '@/lib/db/schema';
import { serializeOrder } from '@/lib/serialize';
import { requireUser } from '@/lib/api-auth';

async function loadOrder(id: string) {
  const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!row) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { row, items };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const found = await loadOrder(id);
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (found.row.userId !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(serializeOrder(found.row, found.items));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await loadOrder(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isOwner = existing.row.userId === user.id;
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();

  // Customers may only update their own payment info; admins can update anything.
  const patch = isAdmin
    ? {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.payment_status !== undefined && { paymentStatus: body.payment_status }),
        ...(body.total !== undefined && { total: String(body.total) }),
        ...(body.tracking_number !== undefined && { trackingNumber: body.tracking_number }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.payment_screenshot !== undefined && { paymentScreenshot: body.payment_screenshot }),
      }
    : {
        ...(body.payment_screenshot !== undefined && { paymentScreenshot: body.payment_screenshot }),
        ...(body.payment_status !== undefined && { paymentStatus: body.payment_status }),
      };

  const [row] = await db
    .update(orders)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  return NextResponse.json(serializeOrder(row, existing.items));
}
