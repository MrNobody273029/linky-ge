// components/NavBar.tsx
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { Button } from '@/components/ui';

// ✅ force fresh render so auth state never stays stale
export const dynamic = 'force-dynamic';

export async function NavBar({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-extrabold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black">L</span>
          <span>Linky.ge</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href={`/${locale}#how`} className="hover:text-fg">
            {t('how')}
          </Link>
          <Link href={`/${locale}#deals`} className="hover:text-fg">
            {t('deals')}
          </Link>
          <Link href={`/${locale}#benefits`} className="hover:text-fg">
            {t('benefits')}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitch />
          <ThemeToggle />

          {!user ? (
            <>
              <Link href={`/${locale}/login`}>
                <Button variant="ghost">{t('login')}</Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button>{t('register')}</Button>
              </Link>
            </>
          ) : (
            <>
              {user.role === 'ADMIN' ? (
                <Link href={`/${locale}/admin`}>
                  <Button variant="ghost">{t('admin')}</Button>
                </Link>
              ) : (
                <Link href={`/${locale}/mypage`}>
                  <Button variant="ghost">{t('dashboard')}</Button>
                </Link>
              )}

              <form action={`/api/auth/logout`} method="post">
                <Button variant="secondary" type="submit">
                  {t('logout')}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
