// app/api/requests/repeat/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { RequestStatus, PaymentStatus } from '@prisma/client';

type Body = {
  sourceRequestId?: string;
  action?: 'preview' | 'confirm';
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
    const action: Body['action'] = body.action || 'preview';

    if (!sourceRequestId) return jsonError('Missing sourceRequestId', 400);

    const source = await prisma.request.findUnique({
      where: { id: sourceRequestId },
      include: { offer: true }
    });

    if (!source || !source.offer) return jsonError('Invalid source request', 400);

    // freshness based on offer.updatedAt
    const offerAgeDays = calcOfferAgeDays(source.offer.updatedAt);
    const isFresh = offerAgeDays <= 7;

    // =========================
    // 1) PREVIEW (NO DB WRITE)
    // =========================
    if (action === 'preview') {
      if (!isFresh) {
        return NextResponse.json({
          ok: true,
          mode: 'EXPIRED',
          offerAgeDays
        });
      }

      return NextResponse.json({
        ok: true,
        mode: 'SHOW_PAY50',
        offerAgeDays,
        linkyPrice: Number(source.offer.linkyPrice),
        currency: source.currency
      });
    }

    // =========================
    // 2) CONFIRM (DB WRITE)
    // =========================

    // ✅ EXPIRED: cooldown + create NEW request as draft for admin
    if (!isFresh) {
      // cooldown (dedupe) only for expired repeats
      const COOLDOWN_MINUTES = 30;
      const cutoff = new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000);

      const existing = await prisma.request.findFirst({
        where: {
          userId: user.id,
          isRepeat: true,
          repeatSourceId: sourceRequestId,
          createdAt: { gte: cutoff },
          status: RequestStatus.NEW
        },
        select: { id: true }
      });

      if (existing) {
        return NextResponse.json({
          ok: true,
          mode: 'NEW_REQUEST_EXISTS',
          requestId: existing.id
        });
      }

      const newReq = await prisma.request.create({
        data: {
          userId: user.id,
          productUrl: source.productUrl,
          titleHint: source.offer.productTitle,
          originalPrice: source.originalPrice,
          currency: source.currency,
          isRepeat: true,
          repeatSourceId: sourceRequestId,

          status: RequestStatus.NEW,
          paymentStatus: PaymentStatus.NONE,

          // draft offer snapshot for admin convenience
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

    // ✅ FRESH + CONFIRMED PAY50:
    // create repeat request and immediately mark as PAID_PARTIALLY + PARTIAL
    const paidReq = await prisma.request.create({
      data: {
        userId: user.id,
        productUrl: source.productUrl,
        titleHint: source.offer.productTitle,
        originalPrice: source.originalPrice,
        currency: source.currency,
        isRepeat: true,

        status: RequestStatus.PAID_PARTIALLY,
        paymentStatus: PaymentStatus.PARTIAL,

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
      select: {
        id: true,
        currency: true,
        offer: { select: { linkyPrice: true } }
      }
    });

    return NextResponse.json({
      ok: true,
      mode: 'PAID_PARTIALLY',
      requestId: paidReq.id,
      linkyPrice: paidReq.offer ? Number(paidReq.offer.linkyPrice) : null,
      currency: paidReq.currency
    });
  } catch (e: any) {
    if (e?.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
