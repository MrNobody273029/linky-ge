export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui';
import { ProductShowcaseCard } from '@/components/ProductShowcaseCard';

export default async function AcceptedPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: 'accepted' });

  const rows = await prisma.request.findMany({
    where: {
      status: 'PAID_PARTIALLY',
      paymentStatus: 'PARTIAL',
      isRepeat: false,
      offer: { is: {} } // ✅ ensure offer exists
    },
    orderBy: { updatedAt: 'desc' },
    take: 200,
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

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">{t('allTitle')}</h1>
          <p className="mt-1 text-sm text-muted">{t('allSubtitle')}</p>
        </div>

        <Link href={`/${locale}`}>
          <Button variant="secondary">{t('back')}</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((r) => (
          <ProductShowcaseCard
            key={r.id}
            locale={locale}
            title={r.offer?.productTitle ?? t('productFallback')}
            imageUrl={r.offer?.imageUrl ?? null}
            originalPrice={r.originalPrice != null ? Number(r.originalPrice) : null}
            linkyPrice={Number(r.offer!.linkyPrice)}
            currency={r.currency}
            etaDays={r.offer!.etaDays}
            sourceRequestId={r.id}
          />
        ))}
      </div>
    </div>
  );
}
