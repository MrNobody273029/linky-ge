// app/[locale]/api/admin/status/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Body = {
  requestId?: string;
  status?: 'IN_PROGRESS' | 'ARRIVED' | 'COMPLETED';
};

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;

  const requestId = String(body.requestId || '').trim();
  const status = body.status;

  if (!requestId || !status) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

  const row = await prisma.request.findUnique({
    where: { id: requestId },
    select: { status: true, paymentStatus: true }
  });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // only allow transitions inside "accepted flow"
  const allowedFrom = ['ACCEPTED', 'PAID_PARTIALLY', 'IN_PROGRESS', 'ARRIVED'];
  if (!allowedFrom.includes(row.status)) {
    return NextResponse.json({ error: 'Not allowed for this request status' }, { status: 400 });
  }

  // Force correct progression
  const progression: Record<string, string[]> = {
    ACCEPTED: ['IN_PROGRESS'],
    PAID_PARTIALLY: ['IN_PROGRESS'],
    IN_PROGRESS: ['ARRIVED'],
    ARRIVED: ['COMPLETED']
  };

  const nextAllowed = progression[row.status] ?? [];
  if (!nextAllowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid transition' }, { status: 400 });
  }

  // ✅ HARD BLOCK: cannot complete until final 50% is paid
  if (status === 'COMPLETED' && row.paymentStatus !== 'FULL') {
    return NextResponse.json({ error: 'Waiting for final payment' }, { status: 400 });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: { status }
  });

  return NextResponse.json({ ok: true });
}
