// app/[locale]/accepted/[idSlug]/page.tsx
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Card, Button } from '@/components/ui';
import { RepeatOrderFlow } from '@/components/RepeatOrderFlow';

const SITE_URL = 'https://www.linky.ge';

// ✅ Put a real, always-available OG image in /public/og/accepted-default.png
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/accepted-default.png`;

function parseId(idSlug: string) {
  // expecting: "<id>-<slug>"
  const idx = idSlug.indexOf('-');
  if (idx === -1) return idSlug; // fallback
  return idSlug.slice(0, idx);
}

function decodeSlugPart(idSlug: string) {
  const idx = idSlug.indexOf('-');
  if (idx === -1) return '';
  const raw = idSlug.slice(idx + 1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function isSafeLocale(locale: string) {
  return locale === 'ka' || locale === 'en';
}

function localeBasePath(locale: string) {
  // your routing is / (ka) and /en (en)
  return locale === 'en' ? '/en' : '';
}

function acceptedUrl(locale: string) {
  return `${SITE_URL}${localeBasePath(locale)}/accepted`;
}

function acceptedItemUrl(locale: string, idSlug: string) {
  return `${SITE_URL}${localeBasePath(locale)}/accepted/${idSlug}`;
}

/* =========================
   SEO METADATA
   - solid fallback title/desc
   - OG fallback image
   - hreflang
========================= */
export async function generateMetadata({
  params
}: {
  params: { locale: string; idSlug: string };
}): Promise<Metadata> {
  const rawLocale = params.locale;
  const locale = isSafeLocale(rawLocale) ? rawLocale : 'ka';
  const { idSlug } = params;

  const id = parseId(idSlug);
  const canonical = acceptedItemUrl(locale, idSlug);

  // Try to fetch offer; if not found, still return strong metadata
  const row = await prisma.request.findFirst({
    where: {
      id,
      status: 'PAID_PARTIALLY',
      paymentStatus: 'PARTIAL',
      isRepeat: false,
      offer: { isNot: null }
    },
    select: {
      currency: true,
      offer: {
        select: {
          productTitle: true,
          imageUrl: true,
          linkyPrice: true
        }
      }
    }
  });

  const slugFallback = decodeSlugPart(idSlug);
  const fallbackTitle =
    locale === 'ka'
      ? slugFallback
        ? `Linky.ge — ${slugFallback}`
        : 'Linky.ge — შეთავაზება'
      : slugFallback
        ? `Linky.ge — ${slugFallback}`
        : 'Linky.ge — Offer';

  const fallbackDescription =
    locale === 'ka'
      ? 'ევროპული შეთავაზებები უკეთეს ფასად — სრული ღირებულებით და ადგილზე მიტანით საქართველოში.'
      : 'Verified European offers at better prices — full cost included and delivery to Georgia.';

  // If we have offer data, use it; else keep fallback but still indexable + nice
  const hasOffer = !!row?.offer?.productTitle;

  const title = hasOffer ? `${row!.offer!.productTitle} | Linky.ge` : fallbackTitle;

  const description = hasOffer
    ? locale === 'ka'
      ? `ევროპული შეთავაზება უკეთეს ფასად. Linky ფასი: ${Number(row!.offer!.linkyPrice).toFixed(2)} ${row!.currency}.`
      : `Verified European offer at a better price. Linky price: ${Number(row!.offer!.linkyPrice).toFixed(2)} ${row!.currency}.`
    : fallbackDescription;

  const ogImage = row?.offer?.imageUrl || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ka: acceptedItemUrl('ka', idSlug),
        en: acceptedItemUrl('en', idSlug)
      }
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: 'Linky.ge',
      images: [{ url: ogImage }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function ProductAcceptedPage({
  params
}: {
  params: { locale: string; idSlug: string };
}) {
  const rawLocale = params.locale;
  const locale = isSafeLocale(rawLocale) ? rawLocale : 'ka';
  const { idSlug } = params;

  const id = parseId(idSlug);
  const user = await getCurrentUser();

  const row = await prisma.request.findFirst({
    where: {
      id,
      status: 'PAID_PARTIALLY',
      paymentStatus: 'PARTIAL',
      isRepeat: false,
      offer: { isNot: null }
    },
    select: {
      id: true,
      currency: true,
      originalPrice: true,
      offer: {
        select: {
          productTitle: true,
          imageUrl: true,
          linkyPrice: true,
          etaDays: true
        }
      }
    }
  });

  if (!row?.offer) return notFound();

  const title = row.offer.productTitle;
  const imageUrl = row.offer.imageUrl;
  const shownImage = imageUrl || '/og/accepted-default.png';

  const linkyPrice = Number(row.offer.linkyPrice);
  const currency = row.currency;
  const originalPrice = row.originalPrice != null ? Number(row.originalPrice) : null;
  const saved = originalPrice != null ? Math.max(0, originalPrice - linkyPrice) : null;

  const canonical = acceptedItemUrl(locale, idSlug);

  // ✅ JSON-LD Product
  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    image: imageUrl ? [imageUrl] : [DEFAULT_OG_IMAGE],
    offers: {
      '@type': 'Offer',
      priceCurrency: currency,
      price: linkyPrice,
      availability: 'https://schema.org/InStock',
      url: canonical
    }
  };

  // ✅ JSON-LD Breadcrumb
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Linky.ge',
        item: `${SITE_URL}${localeBasePath(locale) || '/'}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'ka' ? 'შეთავაზებები' : 'Offers',
        item: acceptedUrl(locale)
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: canonical
      }
    ]
  };

  return (
    <div className="container py-10">
      {/* ✅ Structured data */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      {/* ✅ Internal linking + better UX */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:underline underline-offset-2" href={locale === 'en' ? '/en' : '/'}>
              Linky.ge
            </Link>
          </li>
          <li aria-hidden className="opacity-60">
            /
          </li>
          <li>
            <Link className="hover:underline underline-offset-2" href={`/${locale}/accepted`}>
              {locale === 'ka' ? 'შეთავაზებები' : 'Offers'}
            </Link>
          </li>
          <li aria-hidden className="opacity-60">
            /
          </li>
          <li className="line-clamp-1 max-w-[70vw] font-semibold text-fg">{title}</li>
        </ol>
      </nav>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-black leading-tight">{title}</h1>

        <Link href={`/${locale}/accepted`}>
          <Button variant="secondary">{locale === 'ka' ? 'უკან' : 'Back'}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-border">
          <Image
            src={shownImage}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
            priority
          />

          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm text-muted">
            {locale === 'ka' ? 'საქართველოს ფასი:' : 'Local price:'}{' '}
            {originalPrice != null ? `${originalPrice.toFixed(2)} ${currency}` : '—'}
          </div>

          <div className="mt-2 text-lg font-semibold text-success">
            Linky: {linkyPrice.toFixed(2)} {currency}
          </div>

          {saved != null ? (
            <div className="mt-2 font-semibold text-yellow-600">
              {locale === 'ka' ? 'დაზოგილია' : 'Saved'} {saved.toFixed(2)} {currency}
            </div>
          ) : null}

          <div className="mt-4 text-xs text-muted">
            {locale === 'ka'
              ? `ჩამოსვლის ვადა: ${row.offer.etaDays} დღე`
              : `Delivery ETA: ${row.offer.etaDays} days`}
          </div>

          {/* ✅ Strong internal linking + share-friendly canonical link */}
          <div className="mt-4 rounded-2xl border border-border bg-card/20 p-3 text-xs text-muted">
            <div className="font-semibold text-fg">{locale === 'ka' ? 'ბმული' : 'Link'}</div>
            <div className="mt-1 break-all">
              <a className="underline underline-offset-2" href={canonical}>
                {canonical}
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <RepeatOrderFlow
              locale={locale}
              sourceRequestId={row.id}
              isAuthed={!!user}
              variant="button"
            />

            <Link href={`/${locale}/accepted`}>
              <Button variant="secondary">
                {locale === 'ka' ? 'ყველა შეთავაზება' : 'All offers'}
              </Button>
            </Link>
          </div>

          {/* ✅ Extra internal link for crawlers + UX */}
          <div className="mt-5 text-xs text-muted">
            {locale === 'ka' ? 'ნახე სხვა შეთავაზებებიც: ' : 'Browse more offers: '}
            <Link className="underline underline-offset-2" href={`/${locale}/accepted`}>
              {locale === 'ka' ? 'ყველა შეთავაზება' : 'All offers'}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
