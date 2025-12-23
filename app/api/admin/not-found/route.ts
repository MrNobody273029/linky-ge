// app/api/admin/not-found/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Body = {
  requestId?: string;
};

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const requestId = String(body.requestId || '').trim();

  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

  const row = await prisma.request.findUnique({
    where: { id: requestId },
    select: { status: true }
  });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // ✅ only allow from NEW/SCOUTING (exactly your flow)
  if (!['NEW', 'SCOUTING'].includes(row.status)) {
    return NextResponse.json({ error: 'Not allowed for this request status' }, { status: 400 });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: {
      status: 'NOT_FOUND',
      cancelReason: 'შეთავაზება არ მოიძებნა'
    }
  });

  return NextResponse.json({ ok: true });
}
