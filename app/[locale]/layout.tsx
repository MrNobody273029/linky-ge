import '@/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { locales } from '@/locales';
import { notFound } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from 'next-themes';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'hero' });
  return {
    title: `Linky.ge — ${t('title1')} ${t('title2')}`,
    description: t('subtitle')
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!locales.includes(locale as any)) notFound();

  // ✅ IMPORTANT: tells next-intl to use the locale from params, not from headers()
  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NavBar locale={locale} />
            <main>{children}</main>
            <Footer locale={locale} />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
