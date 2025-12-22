// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

function pickLocaleFromReferer(req: Request) {
  const ref = req.headers.get('referer') || '';
  const m = ref.match(/\/(ka|en)(\/|$)/);
  return (m?.[1] as 'ka' | 'en' | undefined) || 'ka';
}

export async function POST(req: Request) {
  await destroySession();

  const url = new URL(req.url);
  const locale = pickLocaleFromReferer(req);

  return NextResponse.redirect(new URL(`/${locale}`, url.origin));
}
