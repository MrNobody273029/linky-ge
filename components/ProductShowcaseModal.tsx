'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  locale: string;
  title: string;
  imageUrl: string | null;
  originalPrice: number | null;
  linkyPrice: number;
  currency: string;
  etaDays: number;
  sourceRequestId: string;
  onClose: () => void;

  // ✅ NEW (optional) — don't break old usages
  isAuthed?: boolean;
};

const FALLBACK_IMAGE = '/og/accepted-default.png';

function calcPay50(total: number) {
  return Math.ceil(total * 0.5);
}

function slugify(input: string) {
  const s = (input || '').trim().toLowerCase();
  const cleaned = s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (cleaned || 'product').slice(0, 80);
}

function getCurrentPathWithQuery() {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function ProductShowcaseModal({
  locale,
  title,
  imageUrl,
  originalPrice,
  linkyPrice,
  currency,
  etaDays,
  sourceRequestId,
  onClose,
  isAuthed = true
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // ✅ PREVIEW modal only (does NOT create request)
  const [payOpen, setPayOpen] = useState(false);

  // ✅ Guest auth-required popup (instead of pay popup)
  const [authOpen, setAuthOpen] = useState(false);

  const pay50Total = linkyPrice;
  const pay50Amount = useMemo(() => calcPay50(pay50Total), [pay50Total]);

  const productHref = useMemo(() => {
    const slug = slugify(title);
    return `/${locale}/accepted/${sourceRequestId}-${encodeURIComponent(slug)}`;
  }, [locale, sourceRequestId, title]);

  // ✅ always show a real image (fallback if missing)
  const shownImage = imageUrl || FALLBACK_IMAGE;

  // =========================
  // ✅ URL sync for modal (no navigation)
  // - on open: pushState -> productHref
  // - on back: close modal
  // - on close/unmount: restore previous URL
  // =========================
  const prevUrlRef = useRef<string>('');
  const pushedRef = useRef(false);
const navigatedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    prevUrlRef.current = getCurrentPathWithQuery();

    // pushState to modal URL (without navigation)
    if (prevUrlRef.current !== productHref) {
      window.history.pushState({ __linky_modal: true }, '', productHref);
      pushedRef.current = true;
    }

    const onPopState = () => {
      // When user presses Back, close modal
      onClose();
    };

    window.addEventListener('popstate', onPopState);

 return () => {
  window.removeEventListener('popstate', onPopState);

  // ✅ თუ რეალურად დავნავიგირდით product page-ზე, აღარ დავაბრუნოთ prevUrl
  if (typeof window !== 'undefined' && pushedRef.current && !navigatedRef.current) {
    window.history.replaceState({}, '', prevUrlRef.current || '/');
  }
};

    // IMPORTANT: only depends on productHref/onClose
  }, [productHref, onClose]);

  function openOrderFlow(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (!sourceRequestId) {
      alert(locale === 'ka' ? 'აკლია sourceRequestId' : 'Missing sourceRequestId');
      return;
    }

    // ✅ If guest -> open auth popup ONLY (no pay popup)
    if (!isAuthed) {
      setAuthOpen(true);
      return;
    }

    // ✅ If authed -> open pay preview popup
    setPayOpen(true);
  }

  async function confirmPay50() {
    if (!sourceRequestId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/requests/repeat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceRequestId, action: 'confirm' })
      });

      const txt = await res.text();
      const j = txt ? JSON.parse(txt) : {};

      if (!res.ok) {
        alert((j as any)?.error ?? (locale === 'ka' ? 'ვერ შესრულდა' : 'Action failed'));
        return;
      }

      if ((j as any)?.mode === 'NEW_REQUEST') {
        alert(
          locale === 'ka'
            ? 'შეთავაზებას გაუვიდა ვადა. გაგზავნილია ახალი მოთხოვნა.'
            : 'The offer has expired. A new request was sent.'
        );
        window.location.href = `/${locale}/mypage?tab=pending`;
        return;
      }

      setPayOpen(false);
      window.location.href = `/${locale}/mypage?tab=inProgress`;
    } catch (err: any) {
      alert(err?.message ?? (locale === 'ka' ? 'ქსელის შეცდომა' : 'Network error'));
    } finally {
      setLoading(false);
    }
  }

  const saved = originalPrice != null ? Math.max(0, originalPrice - linkyPrice) : null;

  // close button should also restore URL immediately
  function handleClose() {
    // restore URL before closing (so no flicker)
    if (typeof window !== 'undefined' && pushedRef.current) {
      window.history.replaceState({}, '', prevUrlRef.current || '/');
      pushedRef.current = false;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <Card className="p-5">
          <div className="relative h-64 w-full rounded-xl bg-border">
            <Image
              src={shownImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-contain"
              priority
            />
          </div>

          <div className="mt-4 text-lg font-black">{title}</div>

          {/* ✅ SEO/share: real URL with name */}
          <div className="mt-1 text-xs text-muted">
 <a
  href={productHref}
  className="underline underline-offset-2"
  onClick={(e) => {
    e.preventDefault();
    navigatedRef.current = true;   // ✅ cleanup აღარ დააბრუნებს prevUrl-ს
    onClose();                     // ✅ დახურე მოდალი
    router.push(productHref);      // ✅ გადადი რეალურ [idSlug] გვერდზე
  }}
>
  {locale === 'ka' ? 'ლინკის ნახვა/გაზიარება' : 'Open / share link'}
</a>

          </div>

          <div className="mt-3 space-y-1 text-sm">
            <div className="text-muted">
              {locale === 'ka' ? 'საქართველოს ფასი:' : 'Local price:'}{' '}
              {originalPrice != null ? `${originalPrice.toFixed(2)} ${currency}` : '—'}
            </div>

            <div className="font-semibold text-success">
              Linky: {linkyPrice.toFixed(2)} {currency}
            </div>

            {saved != null ? (
              <div className="font-semibold text-yellow-600">
                {locale === 'ka' ? 'დაზოგილია' : 'Saved'} {saved.toFixed(2)} {currency}
              </div>
            ) : null}

            <div className="pt-2 text-xs text-muted">
              {locale === 'ka' ? `ჩამოსვლის ვადა: ${etaDays} დღე` : `Delivery ETA: ${etaDays} days`}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              {locale === 'ka' ? 'დახურვა' : 'Close'}
            </Button>

            <Button onClick={openOrderFlow} className="bg-accent text-black hover:bg-accent/90" disabled={loading}>
              {locale === 'ka' ? 'შეუკვეთე შენც' : 'Order yours'}
            </Button>
          </div>
        </Card>

        {/* ✅ GUEST: AUTH REQUIRED POPUP */}
        {authOpen ? (
          <div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6"
            onClick={() => setAuthOpen(false)}
          >
            <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <Card className="overflow-hidden p-4 md:p-5">
                <div className="text-lg font-black">{locale === 'ka' ? 'ავტორიზაცია საჭიროა' : 'Authorization required'}</div>

                <div className="mt-1 text-sm text-muted">
                  {locale === 'ka'
                    ? 'პროდუქტის შესაკვეთად გთხოვთ გაიარეთ ავტორიზაცია ან რეგისტრაცია.'
                    : 'To order this product, please log in or create an account.'}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setAuthOpen(false)}>
                    {locale === 'ka' ? 'დახურვა' : 'Close'}
                  </Button>

                  <Button
                    onClick={() => {
                      setAuthOpen(false);
                      handleClose();
                      router.push(`/${locale}/register`);
                    }}
                  >
                    {locale === 'ka' ? 'ავტორიზაცია / რეგისტრაცია' : 'Login / Register'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {/* ✅ AUTHED: PAY 50 PREVIEW POPUP */}
        {payOpen ? (
          <div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6"
            onClick={() => !loading && setPayOpen(false)}
          >
            <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <Card className="overflow-hidden p-4 md:p-5">
                <div className="text-lg font-black">{locale === 'ka' ? 'წინასწარი გადახდის დადასტურება' : 'Confirm prepayment'}</div>

                <div className="mt-1 text-sm text-muted">
                  {locale === 'ka'
                    ? 'შეთავაზების დასადასტურებლად საჭიროა 50%-ის გადახდა.'
                    : 'To accept this offer you need to pay 50% upfront.'}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border bg-card/40 p-3">
                    <div className="text-xs font-semibold text-muted">{locale === 'ka' ? 'Linky ფასი' : 'Linky price'}</div>
                    <div className="mt-1 text-sm font-semibold">
                      {pay50Total} {currency}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card/40 p-3">
                    <div className="text-xs font-semibold text-muted">{locale === 'ka' ? '50%-ის თანხა' : '50% amount'}</div>
                    <div className="mt-1 text-sm font-semibold">
                      {pay50Amount} {currency}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-border bg-card/30 p-3 text-sm text-muted">
                  {locale === 'ka'
                    ? 'ეს არის წინასწარი 50% — შეკვეთის დასადასტურებლად. დარჩენილი თანხა გადაიხდება როცა შეკვეთა ჩამოვა.'
                    : 'This is a 50% prepayment to confirm the order. The remaining amount is paid after the order arrives.'}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" disabled={loading} onClick={() => setPayOpen(false)}>
                    {locale === 'ka' ? 'დახურვა' : 'Close'}
                  </Button>

                  <Button disabled={loading} onClick={confirmPay50}>
                    {loading ? (locale === 'ka' ? 'იგზავნება…' : 'Processing…') : locale === 'ka' ? 'გადახდა (დემო)' : 'Pay (demo)'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
