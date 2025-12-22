// app/api/requests/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { PaymentStatus, RequestStatus } from '@prisma/client';

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
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const productUrl = String(body.productUrl || '').trim();
    const titleHint = body.titleHint ? String(body.titleHint).trim() : undefined;
    const originalPrice = body.originalPrice ? Number(body.originalPrice) : undefined;

    if (!isHttpUrl(productUrl)) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    }

    await prisma.request.create({
      data: {
        userId: user.id,
        productUrl,
        titleHint,
        originalPrice: Number.isFinite(originalPrice) ? Math.round(originalPrice!) : undefined,
        status: RequestStatus.NEW,
        paymentStatus: PaymentStatus.NONE
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

type PatchBody = {
  id?: string;
action?: 'pay50' | 'pay50_rest' | 'decline';
  reason?: string;
};

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as PatchBody;

    const id = String(body.id || '').trim();
    const action = body.action;
    const reasonRaw = String(body.reason || '').trim();

    if (!id || !action) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const r = await prisma.request.findFirst({
      where: { id, userId: user.id },
      include: { offer: true }
    });
    if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });

// ✅ pay 50% (demo): only when OFFERED and offer exists
if (action === 'pay50') {
  if (r.status !== 'OFFERED') return NextResponse.json({ error: 'Not allowed' }, { status: 400 });
  if (!r.offer) return NextResponse.json({ error: 'No offer yet' }, { status: 400 });

  await prisma.request.update({
    where: { id },
    data: {
      status: RequestStatus.PAID_PARTIALLY,
      paymentStatus: PaymentStatus.PARTIAL
    }
  });

  return NextResponse.json({ ok: true });
}


// ✅ pay remaining 50% (demo): only when ARRIVED and payment is PARTIAL
if (action === 'pay50_rest') {
  if (r.status !== 'ARRIVED') return NextResponse.json({ error: 'Not arrived yet' }, { status: 400 });
  if (r.paymentStatus !== 'PARTIAL') return NextResponse.json({ error: 'Not allowed' }, { status: 400 });

  await prisma.request.update({
    where: { id },
    data: { paymentStatus: PaymentStatus.FULL }
  });

  return NextResponse.json({ ok: true });
}


    // ✅ decline (optional reason): only when OFFERED
    if (action === 'decline') {
      if (r.status !== 'OFFERED') return NextResponse.json({ error: 'Not allowed' }, { status: 400 });

      const reason = reasonRaw ? reasonRaw.slice(0, 500) : null;

      await prisma.request.update({
        where: { id },
        data: { status: RequestStatus.DECLINED, cancelReason: reason }
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    if (e?.message === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
