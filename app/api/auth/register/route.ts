import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const username = String(body.username || '').trim();
  const email = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '');
  const fullAddress = String(body.fullAddress || '').trim();
  const phone = String(body.phone || '').trim();

  if (!username || !email || password.length < 8 || fullAddress.length < 5 || phone.length < 7) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) return NextResponse.json({ error: 'Email or username already in use' }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, fullAddress, phone }
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
