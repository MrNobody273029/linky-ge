// app/api/admin/offer/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

function isHttpUrl(u: string) {
  try {
    const x = new URL(u);
    return x.protocol === 'http:' || x.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fd = await req.formData();

  const requestId = String(fd.get('requestId') || '').trim();

  // ✅ NEW (required)
  const productTitle = String(fd.get('productTitle') || '').trim();

  const originalPriceRaw = String(fd.get('originalPrice') || '').trim();
  const linkyPriceRaw = String(fd.get('linkyPrice') || '').trim();
  const etaDaysRaw = String(fd.get('etaDays') || '').trim();

  // optional
  const note = String(fd.get('note') || '').trim();

  // ✅ required (admin-only but must be filled)
  const adminSourceUrl = String(fd.get('adminSourceUrl') || '').trim();

  // optional image
  const file = fd.get('image') as File | null;

  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

  // ✅ required fields
  const missing: string[] = [];
  if (!productTitle) missing.push('productTitle');
  if (!originalPriceRaw) missing.push('originalPrice');
  if (!linkyPriceRaw) missing.push('linkyPrice');
  if (!etaDaysRaw) missing.push('etaDays');
  if (!adminSourceUrl) missing.push('adminSourceUrl');

  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  // ✅ adminSourceUrl basic validation (url)
  if (!isHttpUrl(adminSourceUrl)) {
    return NextResponse.json({ error: 'Invalid adminSourceUrl' }, { status: 400 });
  }

  const originalPrice = Number(originalPriceRaw);
  const linkyPrice = Number(linkyPriceRaw);
  const etaDays = Number(etaDaysRaw);

  if (!Number.isFinite(originalPrice) || !Number.isFinite(linkyPrice) || !Number.isFinite(etaDays)) {
    return NextResponse.json({ error: 'Invalid numbers' }, { status: 400 });
  }
  if (etaDays <= 0) {
    return NextResponse.json({ error: 'Invalid etaDays' }, { status: 400 });
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

  // ✅ image is optional even for first offer
  // If no upload and no existing image -> keep null
  const nextImageUrl = imageUrl ?? (existing?.imageUrl ?? null);

  await prisma.request.update({
    where: { id: requestId },
    data: {
      originalPrice,
      titleHint: productTitle, // ✅ update request title for UI
      status: 'OFFERED',
      offer: existing
        ? {
            update: {
              productTitle, // ✅ NEW
              linkyPrice,
              etaDays,
              note: note || null,
              imageUrl: nextImageUrl, // ✅ may be null
              adminSourceUrl // ✅ required, store as string (not null)
            }
          }
        : {
            create: {
              productTitle, // ✅ NEW
              linkyPrice,
              etaDays,
              note: note || null,
              imageUrl: nextImageUrl, // ✅ may be null
              adminSourceUrl // ✅ required
            }
          }
    }
  });

  return NextResponse.json({ ok: true });
}
