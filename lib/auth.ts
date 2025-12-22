import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Role, User } from '@prisma/client';

const COOKIE_NAME = 'linky_session';

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export type SafeUser = Pick<User, 'id' | 'email' | 'username' | 'role' | 'fullAddress' | 'phone'>;

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = sha256(token);
  const days = 30;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId, tokenHash, expiresAt }
  });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt
  });
}

export async function destroySession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = sha256(token);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
  }
  cookies().set(COOKIE_NAME, '', { path: '/', expires: new Date(0) });
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const tokenHash = sha256(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    fullAddress: user.fullAddress,
    phone: user.phone
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) throw new Error('FORBIDDEN');
  return user;
}
