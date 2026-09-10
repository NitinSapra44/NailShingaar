import { NextResponse } from 'next/server';
import { requireUser, requireAdmin } from '@/lib/api-auth';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';

const ALLOWED_FOLDERS = ['product-images', 'nail-photos', 'payment-screenshots'] as const;
type Folder = (typeof ALLOWED_FOLDERS)[number];

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const folder = formData.get('folder');

  if (!(file instanceof File) || typeof folder !== 'string' || !ALLOWED_FOLDERS.includes(folder as Folder)) {
    return NextResponse.json({ error: 'Invalid upload request' }, { status: 400 });
  }

  if (folder === 'product-images') {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } else {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadBufferToCloudinary(buffer, folder);

  return NextResponse.json({ url: result.secure_url });
}
