// app/api/admin/offer/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { triggerEmail } from '@/lib/email/events';

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

  // ✅ required
  const productTitle = String(fd.get('productTitle') || '').trim();
  const originalPriceRaw = String(fd.get('originalPrice') || '').trim();
  const linkyPriceRaw = String(fd.get('linkyPrice') || '').trim();
  const etaDaysRaw = String(fd.get('etaDays') || '').trim();

  // optional
  const note = String(fd.get('note') || '').trim();

  // ✅ admin-only but required
  const adminSourceUrl = String(fd.get('adminSourceUrl') || '').trim();

  // optional image
  const file = fd.get('image') as File | null;

  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

  const missing: string[] = [];
  if (!productTitle) missing.push('productTitle');
  if (!originalPriceRaw) missing.push('originalPrice');
  if (!linkyPriceRaw) missing.push('linkyPrice');
  if (!etaDaysRaw) missing.push('etaDays');
  if (!adminSourceUrl) missing.push('adminSourceUrl');

  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
  }

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

  const nextImageUrl = imageUrl ?? (existing?.imageUrl ?? null);

  // ✅ update + return only what we need for email (NO adminSourceUrl in select payload)
  const updated = await prisma.request.update({
    where: { id: requestId },
    data: {
      originalPrice,
      titleHint: productTitle,
      status: 'OFFERED',
      offer: existing
        ? {
            update: {
              productTitle,
              linkyPrice,
              etaDays,
              note: note || null,
              imageUrl: nextImageUrl,
              adminSourceUrl // stored, BUT we won't email it
            }
          }
        : {
            create: {
              productTitle,
              linkyPrice,
              etaDays,
              note: note || null,
              imageUrl: nextImageUrl,
              adminSourceUrl
            }
          }
    },
    select: {
      id: true,
      currency: true,
      originalPrice: true,
      titleHint: true,
      user: { select: { email: true, username: true } },
      offer: { select: { imageUrl: true, linkyPrice: true, etaDays: true, note: true } }
    }
  });

  // ✅ USER email — offer created (NO adminSourceUrl ever sent)
  try {
    const appUrl = process.env.APP_URL || '';
    const ctaUrl = `${appUrl}/mypage?tab=offers`;

    await triggerEmail({
      event: 'USER_OFFER_CREATED',
      to: updated.user.email,
      payload: {
        username: updated.user.username,
        requestTitle: updated.titleHint || 'პროდუქტი',
        originalPriceGel: updated.originalPrice == null ? null : Number(updated.originalPrice),
        offerPriceGel: updated.offer ? Number(updated.offer.linkyPrice) : linkyPrice,
        etaDays: updated.offer?.etaDays ?? etaDays,
        expiresInDays: 7,
        imageUrl: updated.offer?.imageUrl ?? null,
        ctaUrl
      }
    });
  } catch (e) {
    console.error('EMAIL FAILED (USER_OFFER_CREATED):', e);
  }

  return NextResponse.json({ ok: true });
}
