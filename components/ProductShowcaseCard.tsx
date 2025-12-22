'use client';

import Image from 'next/image';
import { Card, Button } from '@/components/ui';
import { useState } from 'react';
import { ProductShowcaseModal } from './ProductShowcaseModal';

type Props = {
  locale: string;
  title: string;
  imageUrl: string | null;
  originalPrice: number | null;
  linkyPrice: number;
  currency: string;
  etaDays: number;

  // ✅ აუცილებელია: რომ repeat-order იმუშაოს
  sourceRequestId: string;
};

export function ProductShowcaseCard({
  locale,
  title,
  imageUrl,
  originalPrice,
  linkyPrice,
  currency,
  etaDays,
  sourceRequestId
}: Props) {
  const [open, setOpen] = useState(false);

  const saved =
    originalPrice != null ? Math.max(0, originalPrice - linkyPrice) : null;

  return (
    <>
      <Card className="relative flex h-full flex-col p-4">
        {/* CLICK AREA */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-1 flex-col text-left"
        >
          {/* IMAGE */}
          <div className="relative h-48 w-full overflow-hidden rounded-xl bg-border">
            {imageUrl ? (
              <Image src={imageUrl} alt={title} fill className="object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">
                {locale === 'ka' ? 'ფოტო არ არის' : 'No image'}
              </div>
            )}
          </div>

          {/* TITLE */}
          <div className="mt-4 line-clamp-2 text-sm font-bold">{title}</div>

          {/* PRICES */}
          <div className="mt-3 space-y-1 text-xs">
            <div className="text-muted">
              {locale === 'ka' ? 'საქართველოს ფასი:' : 'Local price:'}{' '}
              {originalPrice != null ? (
                <span className="text-sm text-muted">
                  {originalPrice.toFixed(2)} {currency}
                </span>
              ) : (
                '—'
              )}
            </div>

            <div className="font-semibold text-success">
              Linky: {linkyPrice.toFixed(2)} {currency}
            </div>

            {saved != null ? (
              <div className="font-semibold text-yellow-600">
                {locale === 'ka' ? 'დაზოგილია' : 'Saved'} {saved.toFixed(2)} {currency}
              </div>
            ) : null}
          </div>
        </button>

        {/* CTA BUTTON */}
        <div className="mt-4 flex justify-end">
          <Button
            className="bg-accent text-black hover:bg-accent/90"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // ✅ რომ ქარდის button click-მა არ “ჩაყლაპოს”
              setOpen(true);       // ✅ ჯერ მოდალს ვხსნით
            }}
          >
            {locale === 'ka' ? 'შეუკვეთე შენც' : 'Order yours'}
          </Button>
        </div>
      </Card>

      {open ? (
        <ProductShowcaseModal
          locale={locale}
          title={title}
          imageUrl={imageUrl}
          originalPrice={originalPrice}
          linkyPrice={linkyPrice}
          currency={currency}
          etaDays={etaDays}
          sourceRequestId={sourceRequestId} 
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
