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
    const offerAgeDays = (Date.now() - source.offer.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    const isFresh = offerAgeDays <= 7;

    // If expired -> create NEW request (no offer) and exit
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
          paymentStatus: PaymentStatus.NONE
        }
      });

      return NextResponse.json({
        ok: true,
        mode: 'NEW_REQUEST',
        requestId: newReq.id
      });
    }

    // ✅ Fresh offer: create repeat request AND mark paid partially immediately
    const paidReq = await prisma.request.create({
      data: {
        userId: user.id,
        productUrl: source.productUrl,
        titleHint: source.offer.productTitle,
        originalPrice: source.originalPrice,
        currency: source.currency,
        isRepeat: true,

        // ✅ immediately becomes "paid partially / in progress bucket"
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
      include: { offer: true }
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
