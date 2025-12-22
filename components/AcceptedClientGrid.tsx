'use client';

import { useMemo, useState } from 'react';
import { Input, Card } from '@/components/ui';
import { useTranslations } from 'next-intl';
import type { Prisma } from '@prisma/client';
import { ProductShowcaseCard } from '@/components/ProductShowcaseCard';

type Row = Prisma.RequestGetPayload<{
  include: {
    user: { select: { username: true } };
    offer: true;
  };
}>;

export function AcceptedClientGrid({
  locale,
  rows
}: {
  locale: string;
  rows: Row[];
}) {
  const t = useTranslations('accepted');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => r.offer?.productTitle?.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <>
      {/* Search */}
      <div className="mt-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === 'ka' ? 'მოძებნე პროდუქტი' : 'Search product'}
          className="sm:w-[360px]"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-2 text-sm font-semibold text-muted hover:text-fg"
          >
            {t('clear')}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((r) => {
          // safeguards: accepted rows should always have offer, but keep safe
          const offer = r.offer;
          if (!offer) return null;

          const original = r.originalPrice ? Number(r.originalPrice) : null;
          const linky = Number(offer.linkyPrice);

          return (
            <ProductShowcaseCard
              key={r.id}
              locale={locale}
              title={offer.productTitle}
              imageUrl={offer.imageUrl}
              originalPrice={original}
              linkyPrice={linky}
              currency={r.currency}
              etaDays={offer.etaDays}
              sourceRequestId={r.id} // ✅ MUST be request id
            />
          );
        })}

        {filtered.length === 0 && (
          <Card className="p-6 sm:col-span-2 lg:col-span-4">
            <div className="text-sm font-bold">{t('emptyTitle')}</div>
            <div className="mt-1 text-sm text-muted">{t('emptyBody')}</div>
          </Card>
        )}
      </div>
    </>
  );
}
