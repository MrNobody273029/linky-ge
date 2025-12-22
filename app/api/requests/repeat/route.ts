import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { RequestStatus, PaymentStatus } from '@prisma/client';

type Body = {
  sourceRequestId?: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function calcOfferAgeDays(offerUpdatedAt: Date) {
  return (Date.now() - offerUpdatedAt.getTime()) / (1000 * 60 * 60 * 24);
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const body = (await req.json().catch(() => ({}))) as Body;
    const sourceRequestId = String(body.sourceRequestId || '').trim();
    if (!sourceRequestId) return jsonError('Missing sourceRequestId', 400);

    const source = await prisma.request.findUnique({
      where: { id: sourceRequestId },
      include: { offer: true }
    });

    if (!source || !source.offer) {
      return jsonError('Invalid source request', 400);
    }

    // ✅ freshness based on offer.updatedAt
    const offerAgeDays = calcOfferAgeDays(source.offer.updatedAt);
    const isFresh = offerAgeDays <= 7;

    // ✅ EXPIRED: create NEW request (repeat), BUT prefill offer as DRAFT for admin
    // NOTE: Request stays NEW so admin sees it under NEW/SCOUTING,
    // and can just hit "Save offer" (updates status to OFFERED).
    if (!isFresh) {
      const newReq = await prisma.request.create({
        data: {
          userId: user.id,
          productUrl: source.productUrl,
          titleHint: source.offer.productTitle,
          originalPrice: source.originalPrice,
          currency: source.currency,
          isRepeat: true,

          status: RequestStatus.NEW,
          paymentStatus: PaymentStatus.NONE,

          // ✅ draft offer snapshot for admin convenience
          offer: {
            create: {
              productTitle: source.offer.productTitle,
              imageUrl: source.offer.imageUrl,
              linkyPrice: source.offer.linkyPrice,
              etaDays: source.offer.etaDays,
              note: source.offer.note ?? null,
              adminSourceUrl: source.offer.adminSourceUrl
            }
          }
        },
        select: { id: true }
      });

      return NextResponse.json({
        ok: true,
        mode: 'NEW_REQUEST',
        requestId: newReq.id
      });
    }

    // ✅ FRESH: create repeat request as OFFERED + NONE (NO payment yet)
    // UI will show pay50 popup, and only on PATCH pay50 will it become PAID_PARTIALLY.
    const offeredReq = await prisma.request.create({
      data: {
        userId: user.id,
        productUrl: source.productUrl,
        titleHint: source.offer.productTitle,
        originalPrice: source.originalPrice,
        currency: source.currency,
        isRepeat: true,

        status: RequestStatus.OFFERED,
        paymentStatus: PaymentStatus.NONE,

        offer: {
          create: {
            productTitle: source.offer.productTitle,
            imageUrl: source.offer.imageUrl,
            linkyPrice: source.offer.linkyPrice,
            etaDays: source.offer.etaDays,
            note: source.offer.note ?? null,
            adminSourceUrl: source.offer.adminSourceUrl
          }
        }
      },
      include: { offer: true }
    });

    return NextResponse.json({
      ok: true,
      mode: 'SHOW_PAY50',
      requestId: offeredReq.id,
      linkyPrice: offeredReq.offer ? Number(offeredReq.offer.linkyPrice) : null,
      currency: offeredReq.currency
    });
  } catch (e: any) {
    if (e?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
