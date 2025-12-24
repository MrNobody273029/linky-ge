export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Card, Button } from '@/components/ui';
import { RepeatOrderFlow } from '@/components/RepeatOrderFlow';

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

export async function generateMetadata({
  params
}: {
  params: { locale: string; idSlug: string };
}): Promise<Metadata> {
  const { locale, idSlug } = params;
  const id = parseId(idSlug);

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

  if (!row?.offer) {
    const slug = decodeSlugPart(idSlug);
    const title = slug ? `Linky.ge — ${slug}` : 'Linky.ge';
    const canonical = `https://www.linky.ge/${locale}/accepted/${idSlug}`;
    return {
      title,
      alternates: { canonical }
    };
  }

  const title = `${row.offer.productTitle} | Linky.ge`;
  const description =
    locale === 'ka'
      ? `ევროპული შეთავაზება უკეთეს ფასად. Linky ფასი: ${Number(row.offer.linkyPrice).toFixed(2)} ${row.currency}.`
      : `Verified European offer at a better price. Linky price: ${Number(row.offer.linkyPrice).toFixed(2)} ${row.currency}.`;

  const canonical = `https://www.linky.ge/${locale}/accepted/${idSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ka: `https://www.linky.ge/accepted/${idSlug}`,
        en: `https://www.linky.ge/en/accepted/${idSlug}`
      }
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: 'Linky.ge',
      images: row.offer.imageUrl ? [{ url: row.offer.imageUrl }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
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
  const { locale, idSlug } = params;
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
  const linkyPrice = Number(row.offer.linkyPrice);
  const currency = row.currency;
  const originalPrice = row.originalPrice != null ? Number(row.originalPrice) : null;
  const saved = originalPrice != null ? Math.max(0, originalPrice - linkyPrice) : null;

  const canonical = `https://www.linky.ge/${locale}/accepted/${idSlug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    image: imageUrl ? [imageUrl] : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: currency,
      price: linkyPrice,
      availability: 'https://schema.org/InStock',
      url: canonical
    }
  };

  return (
    <div className="container py-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-black">{title}</h1>

        <Link href={`/${locale}/accepted`}>
          <Button variant="secondary">{locale === 'ka' ? 'უკან' : 'Back'}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-border">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                {locale === 'ka' ? 'ფოტო არ არის' : 'No image'}
              </div>
            )}
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

          <div className="mt-6 flex flex-wrap gap-2">
            {!user ? (
              <RepeatOrderFlow
                locale={locale}
                sourceRequestId={row.id}
                isAuthed={false}
                variant="button"
              />
            ) : (
              <RepeatOrderFlow
                locale={locale}
                sourceRequestId={row.id}
                isAuthed={true}
                variant="button"
              />
            )}

            <Link href={`/${locale}/accepted`}>
              <Button variant="secondary">{locale === 'ka' ? 'ყველა შეთავაზება' : 'All offers'}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
