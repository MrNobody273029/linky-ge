// components/Footer.tsx

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'footer' });

  return (
    <footer className="border-t border-border bg-bg">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-extrabold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black">
            L
          </span>
          <span>Linky.ge</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
          <Link href={`/${locale}`} className="hover:text-fg">{t('terms')}</Link>
          <Link href={`/${locale}`} className="hover:text-fg">{t('privacy')}</Link>
          <Link href={`/${locale}`} className="hover:text-fg">{t('support')}</Link>
          <Link href={`/${locale}`} className="hover:text-fg">{t('about')}</Link>
        </div>

        <div className="text-xs text-muted">
          © {new Date().getFullYear()} Linky.ge. {t('rights')}
        </div>
      </div>
    </footer>
  );
}
