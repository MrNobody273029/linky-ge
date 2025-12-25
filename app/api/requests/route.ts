// app/api/requests/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PaymentStatus, RequestStatus } from "@prisma/client";
import { triggerEmail } from "@/lib/email/events";
import { buildAppUrl } from "@/lib/email/buildLinks";

function isHttpUrl(u: string) {
  try {
    const x = new URL(u);
    return x.protocol === "http:" || x.protocol === "https:";
  } catch {
    return false;
  }
}

// ✅ helpers (same math as UI)
function calcPay50(total: number) {
  return Math.ceil(total * 0.5);
}
function calcPayRest(total: number) {
  const p50 = calcPay50(total);
  return Math.max(0, total - p50);
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const productUrl = String(body.productUrl || "").trim();
    const titleHint = body.titleHint ? String(body.titleHint).trim() : undefined;
    const originalPrice = body.originalPrice ? Number(body.originalPrice) : undefined;

    if (!isHttpUrl(productUrl)) {
      return NextResponse.json({ error: "Invalid link" }, { status: 400 });
    }

    const created = await prisma.request.create({
      data: {
        userId: user.id,
        productUrl,
        titleHint,
        originalPrice: Number.isFinite(originalPrice) ? Math.round(originalPrice!) : undefined,
        status: RequestStatus.NEW,
        paymentStatus: PaymentStatus.NONE
      },
      select: { id: true }
    });

    // ✅ ADMIN email — new request received
    try {
      const appUrl = buildAppUrl();
      const res = await triggerEmail({
        event: "ADMIN_NEW_REQUEST",
        to: process.env.ADMIN_EMAIL || "support@linky.ge",
        payload: {
          username: user.username,
          requestTitle: titleHint || productUrl,
          requestUrl: `${appUrl}/admin?request=${created.id}`
        }
      });

      console.log("EMAIL SENT:", res);
    } catch (e) {
      console.error("EMAIL FAILED:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

type PatchBody = {
  id?: string;
  action?: "pay50" | "pay50_rest" | "decline";
  reason?: string;
};

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as PatchBody;

    const id = String(body.id || "").trim();
    const action = body.action;
    const reasonRaw = String(body.reason || "").trim();

    if (!id || !action) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const r = await prisma.request.findFirst({
      where: { id, userId: user.id },
      include: {
        offer: true,
        user: { select: { email: true, username: true } }
      }
    });
    if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const requestTitle = (r.titleHint || r.productUrl || "პროდუქტი").slice(0, 140);
    const appUrl = buildAppUrl();
    const userCtaUrl = `${appUrl}/mypage?tab=inProgress`;
    const adminRequestUrl = `${appUrl}/admin?request=${r.id}`;

    // ✅ pay 50% (demo): only when OFFERED and offer exists
    if (action === "pay50") {
      if (r.status !== "OFFERED") return NextResponse.json({ error: "Not allowed" }, { status: 400 });
      if (!r.offer) return NextResponse.json({ error: "No offer yet" }, { status: 400 });

      await prisma.request.update({
        where: { id },
        data: {
          status: RequestStatus.PAID_PARTIALLY,
          paymentStatus: PaymentStatus.PARTIAL
        }
      });

      // ✅ EMAILS (confirmed update) — USER + ADMIN
      try {
        const total = Number(r.offer.linkyPrice);
        const amountGel = calcPay50(total);

        await triggerEmail({
          event: "USER_PAYMENT_RECEIVED",
          to: r.user.email,
          payload: {
            username: r.user.username,
            requestTitle,
            amountGel,
            paymentStatus: "PARTIAL",
            ctaUrl: userCtaUrl
          }
        });

        await triggerEmail({
          event: "ADMIN_PAYMENT_RECEIVED",
          to: process.env.ADMIN_EMAIL || "support@linky.ge",
          payload: {
            username: r.user.username,
            userEmail: r.user.email,
            requestTitle,
            amountGel,
            paymentStatus: "PARTIAL",
            requestUrl: adminRequestUrl
          }
        });

        console.log("EMAIL SENT: payment PARTIAL");
      } catch (e) {
        console.error("EMAIL FAILED:", e);
      }

      return NextResponse.json({ ok: true });
    }

    // ✅ pay remaining 50% (demo): only when ARRIVED and payment is PARTIAL
    if (action === "pay50_rest") {
      if (r.status !== "ARRIVED") return NextResponse.json({ error: "Not arrived yet" }, { status: 400 });
      if (r.paymentStatus !== "PARTIAL") return NextResponse.json({ error: "Not allowed" }, { status: 400 });
      if (!r.offer) return NextResponse.json({ error: "No offer yet" }, { status: 400 });

      await prisma.request.update({
        where: { id },
        data: { paymentStatus: PaymentStatus.FULL }
      });

      // ✅ EMAILS (confirmed update) — USER + ADMIN
      try {
        const total = Number(r.offer.linkyPrice);
        const amountGel = calcPayRest(total);

        await triggerEmail({
          event: "USER_PAYMENT_RECEIVED",
          to: r.user.email,
          payload: {
            username: r.user.username,
            requestTitle,
            amountGel,
            paymentStatus: "FULL",
            ctaUrl: userCtaUrl
          }
        });

        await triggerEmail({
          event: "ADMIN_PAYMENT_RECEIVED",
          to: process.env.ADMIN_EMAIL || "support@linky.ge",
          payload: {
            username: r.user.username,
            userEmail: r.user.email,
            requestTitle,
            amountGel,
            paymentStatus: "FULL",
            requestUrl: adminRequestUrl
          }
        });

        console.log("EMAIL SENT: payment FULL");
      } catch (e) {
        console.error("EMAIL FAILED:", e);
      }

      return NextResponse.json({ ok: true });
    }

    // ✅ decline (optional reason): only when OFFERED
    if (action === "decline") {
      if (r.status !== "OFFERED") return NextResponse.json({ error: "Not allowed" }, { status: 400 });

      const reason = reasonRaw ? reasonRaw.slice(0, 500) : null;

      await prisma.request.update({
        where: { id },
        data: { status: RequestStatus.DECLINED, cancelReason: reason }
      });

      // ❌ no emails on cancel/decline (as requested)
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
