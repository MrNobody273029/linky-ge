// app/api/admin/not-found/route.ts

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerEmail } from "@/lib/email/events";

type Body = {
  requestId?: string;
};

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const requestId = String(body.requestId || "").trim();

  if (!requestId) return NextResponse.json({ error: "Missing requestId" }, { status: 400 });

  const row = await prisma.request.findUnique({
    where: { id: requestId },
    select: {
      status: true,
      titleHint: true,
      productUrl: true,
      user: { select: { email: true, username: true } }
    }
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ✅ only allow from NEW/SCOUTING (exactly your flow)
  if (!["NEW", "SCOUTING"].includes(row.status)) {
    return NextResponse.json({ error: "Not allowed for this request status" }, { status: 400 });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: {
      status: "NOT_FOUND",
      cancelReason: "შეთავაზება არ მოიძებნა"
    }
  });

  // ✅ USER email — not found (separate event)
  try {
    const requestTitle = (row.titleHint || row.productUrl || "პროდუქტი").slice(0, 120);

    const res = await triggerEmail({
      event: "USER_NOT_FOUND",
      to: row.user.email,
      payload: {
        username: row.user.username,
        requestTitle,
        ctaUrl: `${process.env.APP_URL}/mypage?tab=offers`
      }
    });

    console.log("EMAIL SENT:", res);
  } catch (e) {
    console.error("EMAIL FAILED:", e);
  }

  return NextResponse.json({ ok: true });
}
