// app/[locale]/api/admin/scout/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Body = { requestId?: string };

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const requestId = String(body.requestId || '');

  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

  const row = await prisma.request.findUnique({
    where: { id: requestId },
    select: { status: true }
  });

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // ✅ only NEW -> SCOUTING (do nothing otherwise)
  if (row.status !== 'NEW') return NextResponse.json({ ok: true });

  await prisma.request.update({
    where: { id: requestId },
    data: { status: 'SCOUTING' }
  });

  return NextResponse.json({ ok: true });
}
