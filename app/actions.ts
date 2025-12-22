'use server';

import { cookies } from 'next/headers';

const THEME_COOKIE = 'linky_theme';

export async function setTheme(theme: 'light' | 'dark') {
  cookies().set(THEME_COOKIE, theme, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}
