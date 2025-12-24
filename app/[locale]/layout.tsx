import '@/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { locales } from '@/locales';
import { notFound } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import type { Metadata } from 'next';

const BASE_URL = 'https://www.linky.ge';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;

  const t = await getTranslations({ locale, namespace: 'hero' });

  const title = `Linky.ge — ${t('title1')} ${t('title2')}`;
  const description = t('subtitle');

  const canonicalUrl =
    locale === 'ka' ? `${BASE_URL}/` : `${BASE_URL}/en`;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ka: `${BASE_URL}/`,
        en: `${BASE_URL}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ka' ? 'ka_GE' : 'en_US',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Linky.ge',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!locales.includes(locale as any)) notFound();

  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden">
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="min-h-screen overflow-x-hidden">
              <NavBar locale={locale} />
              <main className="min-h-[60vh]">{children}</main>
              <Footer locale={locale} />
            </div>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
