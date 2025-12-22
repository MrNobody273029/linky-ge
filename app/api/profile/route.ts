// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const COOLDOWN_DAYS = 10;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

type Body = {
  fullAddress?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

function now() {
  return new Date();
}

function inCooldown(last: Date | null | undefined) {
  if (!last) return false;
  return Date.now() - last.getTime() < COOLDOWN_MS;
}

function daysLeft(last: Date) {
  const leftMs = COOLDOWN_MS - (Date.now() - last.getTime());
  return Math.max(0, Math.ceil(leftMs / (24 * 60 * 60 * 1000)));
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json().catch(() => ({}))) as Body;

    const nextAddress = (body.fullAddress ?? '').trim();
    const nextPhone = (body.phone ?? '').trim();

    const wantsAddress = nextAddress.length > 0;
    const wantsPhone = nextPhone.length > 0;

    const wantsPassword =
      (body.currentPassword ?? '').trim().length > 0 ||
      (body.newPassword ?? '').trim().length > 0 ||
      (body.confirmPassword ?? '').trim().length > 0;

    if (!wantsAddress && !wantsPhone && !wantsPassword) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullAddress: true,
        phone: true,
        passwordHash: true,
        addressUpdatedAt: true,
        phoneUpdatedAt: true,
        passwordUpdatedAt: true
      }
    });

    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data: any = {};

    // ✅ address update + cooldown
    if (wantsAddress && nextAddress !== dbUser.fullAddress) {
      if (inCooldown(dbUser.addressUpdatedAt)) {
        return NextResponse.json(
          { error: 'Address cooldown', field: 'address', daysLeft: daysLeft(dbUser.addressUpdatedAt!) },
          { status: 400 }
        );
      }
      data.fullAddress = nextAddress;
      data.addressUpdatedAt = now();
    }

    // ✅ phone update + cooldown
    if (wantsPhone && nextPhone !== dbUser.phone) {
      if (inCooldown(dbUser.phoneUpdatedAt)) {
        return NextResponse.json(
          { error: 'Phone cooldown', field: 'phone', daysLeft: daysLeft(dbUser.phoneUpdatedAt!) },
          { status: 400 }
        );
      }
      data.phone = nextPhone;
      data.phoneUpdatedAt = now();
    }

    // ✅ password update + cooldown
    if (wantsPassword) {
      const currentPassword = (body.currentPassword ?? '').trim();
      const newPassword = (body.newPassword ?? '').trim();
      const confirmPassword = (body.confirmPassword ?? '').trim();

      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json({ error: 'Fill all password fields' }, { status: 400 });
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password too short' }, { status: 400 });
      }
      if (inCooldown(dbUser.passwordUpdatedAt)) {
        return NextResponse.json(
          { error: 'Password cooldown', field: 'password', daysLeft: daysLeft(dbUser.passwordUpdatedAt!) },
          { status: 400 }
        );
      }

      const ok = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!ok) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

      const hash = await bcrypt.hash(newPassword, 10);
      data.passwordHash = hash;
      data.passwordUpdatedAt = now();
    }

    // თუ რეალურად არაფერი იცვლება
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: true, unchanged: true });
    }

    await prisma.user.update({
      where: { id: user.id },
      data
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
