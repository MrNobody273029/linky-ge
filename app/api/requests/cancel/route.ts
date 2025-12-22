// app/[locale]/api/request/cancel/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

type Body = {
  requestId?: string;
  reason?: string;
};

export async function PATCH(req: Request) {
  let user: any;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;

  const requestId = String(body.requestId || '').trim();
  const reasonRaw = String(body.reason || '').trim();

  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

  const row = await prisma.request.findUnique({
    where: { id: requestId },
    select: { id: true, userId: true, status: true }
  });

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (row.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Only allow cancel while not completed (safe default)
  const cancellable = ['NEW', 'SCOUTING', 'OFFERED', 'ACCEPTED', 'PAID_PARTIALLY', 'IN_PROGRESS', 'ARRIVED'];
  if (!cancellable.includes(row.status)) {
    return NextResponse.json({ error: 'Cannot cancel at this stage' }, { status: 400 });
  }

  // limit reason size (prevents abuse / logs issues)
  const reason = reasonRaw ? reasonRaw.slice(0, 500) : null;

  await prisma.request.update({
    where: { id: requestId },
    data: { status: 'CANCELLED', cancelReason: reason }
  });

  return NextResponse.json({ ok: true });
}
