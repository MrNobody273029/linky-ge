// app/api/admin/status/route.ts

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerEmail } from "@/lib/email/events";
import { buildAppUrl } from "@/lib/email/buildLinks";

type Body = {
  requestId?: string;
  status?: "IN_PROGRESS" | "ARRIVED" | "COMPLETED";
};

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;

  const requestId = String(body.requestId || "").trim();
  const status = body.status;

  if (!requestId || !status) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  const row = await prisma.request.findUnique({
    where: { id: requestId },
    select: {
      status: true,
      paymentStatus: true,
      titleHint: true,
      productUrl: true,
      offer: { select: { linkyPrice: true } },
      user: { select: { email: true, username: true } }
    }
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // only allow transitions inside "accepted flow"
  const allowedFrom = ["ACCEPTED", "PAID_PARTIALLY", "IN_PROGRESS", "ARRIVED"];
  if (!allowedFrom.includes(row.status)) {
    return NextResponse.json({ error: "Not allowed for this request status" }, { status: 400 });
  }

  // Force correct progression
  const progression: Record<string, string[]> = {
    ACCEPTED: ["IN_PROGRESS"],
    PAID_PARTIALLY: ["IN_PROGRESS"],
    IN_PROGRESS: ["ARRIVED"],
    ARRIVED: ["COMPLETED"]
  };

  const nextAllowed = progression[row.status] ?? [];
  if (!nextAllowed.includes(status)) {
    return NextResponse.json({ error: "Invalid transition" }, { status: 400 });
  }

  // ✅ HARD BLOCK: cannot complete until final 50% is paid
  if (status === "COMPLETED" && row.paymentStatus !== "FULL") {
    return NextResponse.json({ error: "Waiting for final payment" }, { status: 400 });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: { status }
  });

  // ✅ USER emails (3 different contents) — only user
  try {
    const requestTitle = (row.titleHint || row.productUrl || "პროდუქტი").slice(0, 140);

    // deep link: mypage tab
    const appUrl = buildAppUrl();
    const ctaUrl = `${appUrl}/mypage?tab=inProgress`;

    if (status === "IN_PROGRESS") {
      await triggerEmail({
        event: "USER_IN_PROGRESS",
        to: row.user.email,
        payload: {
          username: row.user.username,
          requestTitle,
          ctaUrl
        }
      });
      console.log("EMAIL SENT: USER_IN_PROGRESS");
    }

    if (status === "ARRIVED") {
      const total = row.offer ? Number(row.offer.linkyPrice) : null;

      await triggerEmail({
        event: "USER_ARRIVED_PAY_REMAINING",
        to: row.user.email,
        payload: {
          username: row.user.username,
          requestTitle,
          totalGel: Number.isFinite(total as any) ? (total as number) : null,
          ctaUrl
        }
      });
      console.log("EMAIL SENT: USER_ARRIVED_PAY_REMAINING");
    }

    if (status === "COMPLETED") {
      await triggerEmail({
        event: "USER_DELIVERED",
        to: row.user.email,
        payload: {
          username: row.user.username,
          requestTitle,
          ctaUrl
        }
      });
      console.log("EMAIL SENT: USER_DELIVERED");
    }
  } catch (e) {
    console.error("EMAIL FAILED:", e);
  }

  return NextResponse.json({ ok: true });
}
