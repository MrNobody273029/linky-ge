import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './locales';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false, // ✅ this forces defaultLocale instead of browser language
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
