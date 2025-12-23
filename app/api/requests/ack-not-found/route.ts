// app/api/requests/ack-not-found/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

type Body = {
  requestId?: string;
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

  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

  const row = await prisma.request.findUnique({
    where: { id: requestId },
    select: { id: true, userId: true, status: true, cancelReason: true }
  });

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (row.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // ✅ only from NOT_FOUND
  if (row.status !== 'NOT_FOUND') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 400 });
  }

  await prisma.request.update({
    where: { id: requestId },
    data: {
      status: 'CANCELLED',
      // keep reason if already set, but ensure it's not empty
      cancelReason: row.cancelReason && row.cancelReason.trim() ? row.cancelReason : 'შეთავაზება არ მოიძებნა'
    }
  });

  return NextResponse.json({ ok: true });
}
