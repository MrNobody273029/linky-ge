// app/[locale]/api/admin/offer/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fd = await req.formData();

  const requestId = String(fd.get('requestId') || '');
  const originalPriceRaw = String(fd.get('originalPrice') || '').trim();
  const linkyPriceRaw = String(fd.get('linkyPrice') || '').trim();
  const etaDaysRaw = String(fd.get('etaDays') || '').trim();
  const note = String(fd.get('note') || '').trim();
  const adminSourceUrl = String(fd.get('adminSourceUrl') || '').trim(); // ✅ new
  const file = fd.get('image') as File | null;

  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
  if (!originalPriceRaw || !linkyPriceRaw || !etaDaysRaw) {
    return NextResponse.json({ error: 'Fill prices and ETA' }, { status: 400 });
  }

  const originalPrice = Number(originalPriceRaw);
  const linkyPrice = Number(linkyPriceRaw);
  const etaDays = Number(etaDaysRaw);

  if (!Number.isFinite(originalPrice) || !Number.isFinite(linkyPrice) || !Number.isFinite(etaDays)) {
    return NextResponse.json({ error: 'Invalid numbers' }, { status: 400 });
  }

  // Only allow offer create/edit if still NEW/SCOUTING/OFFERED
  const reqRow = await prisma.request.findUnique({
    where: { id: requestId },
    select: { status: true }
  });
  if (!reqRow) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

  if (!['NEW', 'SCOUTING', 'OFFERED'].includes(reqRow.status)) {
    return NextResponse.json({ error: 'Offer cannot be edited for this status' }, { status: 400 });
  }

  const existing = await prisma.offer.findUnique({ where: { requestId } });

  let imageUrl: string | null = null;
  if (file && file.size > 0) {
    try {
      imageUrl = await uploadToCloudinary(file, { folder: 'linky/offers' });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Image upload failed' }, { status: 400 });
    }
  }

  if (!existing && !imageUrl) {
    return NextResponse.json({ error: 'Image is required for first offer' }, { status: 400 });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: {
      originalPrice,
      status: 'OFFERED',
      offer: existing
        ? {
            update: {
              linkyPrice,
              etaDays,
              note: note || null,
              imageUrl: imageUrl ?? existing.imageUrl,
              adminSourceUrl: adminSourceUrl || null
            }
          }
        : {
            create: {
              linkyPrice,
              etaDays,
              note: note || null,
              imageUrl: imageUrl!,
              adminSourceUrl: adminSourceUrl || null
            }
          }
    }
  });

  return NextResponse.json({ ok: true });
}
