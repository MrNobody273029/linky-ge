import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

export async function NavBar({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-3 overflow-x-hidden">
        {/* LEFT: logo (truncate / no overlap) */}
        <Link
          href={`/${locale}`}
          className="flex min-w-0 items-center gap-2 font-extrabold"
        >
          <Image
            src="/logo.png"
            alt="Linky.ge"
            width={32}
            height={32}
            className="shrink-0 rounded-full"
            priority
          />
          {/* ✅ hide text on very small screens to prevent overlap */}
          <span className="hidden min-w-0 truncate sm:inline">Linky.ge</span>
        </Link>

        {/* CENTER: nav links (desktop only) */}
        <nav className="hidden min-w-0 items-center gap-6 text-sm text-muted md:flex">
          <Link href={`/${locale}#send`} className="hover:text-fg">
            {t('send')}
          </Link>
          <Link href={`/${locale}#how`} className="hover:text-fg">
            {t('how')}
          </Link>
          <Link href={`/${locale}#deals`} className="hover:text-fg">
            {t('deals')}
          </Link>
        </nav>

        {/* RIGHT: controls (never overlap, never overflow) */}
        <div className="flex shrink-0 items-center justify-end gap-2">
          <LocaleSwitch />
          <ThemeToggle />

          {!user ? (
            <>
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" className="whitespace-nowrap">
                  {t('login')}
                </Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button className="whitespace-nowrap">{t('register')}</Button>
              </Link>
            </>
          ) : (
            <>
              {user.role === 'ADMIN' ? (
                <Link href={`/${locale}/admin`}>
                  <Button variant="ghost" className="whitespace-nowrap">
                    {t('admin')}
                  </Button>
                </Link>
              ) : (
                <Link href={`/${locale}/mypage`}>
                  <Button variant="ghost" className="whitespace-nowrap">
                    {t('dashboard')}
                  </Button>
                </Link>
              )}

              <form action={`/api/auth/logout`} method="post">
                <Button variant="secondary" type="submit" className="whitespace-nowrap">
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
