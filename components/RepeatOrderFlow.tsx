// components/RepeatOrderFlow.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';

type Props = {
  locale: string;
  sourceRequestId: string;
  isAuthed: boolean;
  variant?: 'button';
};

function calcPay50(total: number) {
  return Math.ceil(total * 0.5);
}

function t(locale: string, ka: string, en: string) {
  return locale === 'ka' ? ka : en;
}

export function RepeatOrderFlow({ locale, sourceRequestId, isAuthed, variant = 'button' }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // authed pay preview popup
  const [payOpen, setPayOpen] = useState(false);

  // guest popup
  const [authOpen, setAuthOpen] = useState(false);

  const [pay50Total, setPay50Total] = useState<number | null>(null);
  const [payCurrency, setPayCurrency] = useState<string | null>(null);

  const pay50Amount = useMemo(() => (pay50Total != null ? calcPay50(pay50Total) : null), [pay50Total]);

  function openOrderFlow(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (!sourceRequestId) {
      alert(t(locale, 'აკლია sourceRequestId', 'Missing sourceRequestId'));
      return;
    }

    if (!isAuthed) {
      setAuthOpen(true);
      return;
    }

    void preparePreview();
  }

  async function preparePreview() {
    setLoading(true);
    try {
      const res = await fetch('/api/requests/repeat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceRequestId, action: 'preview' })
      });

      const txt = await res.text();
      const j = txt ? JSON.parse(txt) : {};

      if (!res.ok) {
        alert((j as any)?.error ?? t(locale, 'ვერ შესრულდა', 'Action failed'));
        return;
      }

      // expired -> immediately inform and redirect to pending after confirm (no pay UI)
      if ((j as any)?.mode === 'EXPIRED') {
        alert(
          t(
            locale,
            'შეთავაზებას გაუვიდა ვადა — შეკვეთა გადაიქცევა ახალ მოთხოვნად.',
            'Offer expired — ordering will create a new request.'
          )
        );
        void confirm(true);
        return;
      }

      if ((j as any)?.mode === 'SHOW_PAY50') {
        const total = Number((j as any)?.linkyPrice ?? 0);
        const cur = String((j as any)?.currency ?? '');

        setPay50Total(Number.isFinite(total) ? total : 0);
        setPayCurrency(cur || null);
        setPayOpen(true);
        return;
      }

      alert(t(locale, 'ვერ მივიღეთ მონაცემები', 'Could not get preview data'));
    } catch (err: any) {
      alert(err?.message ?? t(locale, 'ქსელის შეცდომა', 'Network error'));
    } finally {
      setLoading(false);
    }
  }

  async function confirm(autoConfirmExpired = false) {
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
        alert((j as any)?.error ?? t(locale, 'ვერ შესრულდა', 'Action failed'));
        return;
      }

      if ((j as any)?.mode === 'NEW_REQUEST') {
        if (!autoConfirmExpired) {
          alert(
            t(
              locale,
              'შეთავაზებას გაუვიდა ვადა. გაგზავნილია ახალი მოთხოვნა.',
              'The offer has expired. A new request was sent.'
            )
          );
        }
        setPayOpen(false);
        window.location.href = `/${locale}/mypage?tab=pending`;
        return;
      }

      if ((j as any)?.mode === 'NEW_REQUEST_EXISTS') {
        alert(
          t(
            locale,
            'ეს მოთხოვნა უკვე გაგზავნილია ცოტა ხნის წინ. გადაგიყვანე Pending-ში.',
            'This request was already sent recently. Redirecting you to Pending.'
          )
        );
        setPayOpen(false);
        window.location.href = `/${locale}/mypage?tab=pending`;
        return;
      }

      if ((j as any)?.mode === 'PAID_PARTIALLY') {
        setPayOpen(false);
        window.location.href = `/${locale}/mypage?tab=inProgress`;
        return;
      }

      // fallback
      setPayOpen(false);
      window.location.href = `/${locale}/mypage?tab=inProgress`;
    } catch (err: any) {
      alert(err?.message ?? t(locale, 'ქსელის შეცდომა', 'Network error'));
    } finally {
      setLoading(false);
    }
  }

  if (variant !== 'button') return null;

  return (
    <>
      <Button onClick={openOrderFlow} disabled={loading} className="bg-accent text-black hover:bg-accent/90">
        {loading ? t(locale, 'იგზავნება…', 'Processing…') : t(locale, 'შეუკვეთე შენც', 'Order yours')}
      </Button>

      {/* GUEST POPUP */}
      {authOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6"
          onClick={() => setAuthOpen(false)}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="overflow-hidden p-4 md:p-5">
              <div className="text-lg font-black">{t(locale, 'ავტორიზაცია საჭიროა', 'Authorization required')}</div>

              <div className="mt-1 text-sm text-muted">
                {t(
                  locale,
                  'პროდუქტის შესაკვეთად გთხოვთ გაიარეთ ავტორიზაცია ან რეგისტრაცია.',
                  'To order this product, please log in or create an account.'
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setAuthOpen(false)}>
                  {t(locale, 'დახურვა', 'Close')}
                </Button>

                <Button
                  onClick={() => {
                    setAuthOpen(false);
                    router.push(`/${locale}/register`);
                  }}
                >
                  {t(locale, 'ავტორიზაცია / რეგისტრაცია', 'Login / Register')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {/* PAY 50 PREVIEW POPUP */}
      {payOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6"
          onClick={() => !loading && setPayOpen(false)}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="overflow-hidden p-4 md:p-5">
              <div className="text-lg font-black">{t(locale, 'წინასწარი გადახდის დადასტურება', 'Confirm prepayment')}</div>

              <div className="mt-1 text-sm text-muted">
                {t(locale, 'შეთავაზების დასადასტურებლად საჭიროა 50%-ის გადახდა.', 'To accept this offer you need to pay 50% upfront.')}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-card/40 p-3">
                  <div className="text-xs font-semibold text-muted">{t(locale, 'Linky ფასი', 'Linky price')}</div>
                  <div className="mt-1 text-sm font-semibold">
                    {pay50Total != null ? pay50Total : '—'} {payCurrency ?? ''}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card/40 p-3">
                  <div className="text-xs font-semibold text-muted">{t(locale, '50%-ის თანხა', '50% amount')}</div>
                  <div className="mt-1 text-sm font-semibold">
                    {pay50Amount != null ? pay50Amount : '—'} {payCurrency ?? ''}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-border bg-card/30 p-3 text-sm text-muted">
                {t(
                  locale,
                  'ეს არის წინასწარი 50% — შეკვეთის დასადასტურებლად. დარჩენილი თანხა გადაიხდება როცა შეკვეთა ჩამოვა.',
                  'This is a 50% prepayment to confirm the order. The remaining amount is paid after the order arrives.'
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" disabled={loading} onClick={() => setPayOpen(false)}>
                  {t(locale, 'დახურვა', 'Close')}
                </Button>

                <Button disabled={loading} onClick={() => confirm(false)}>
                  {loading ? t(locale, 'იგზავნება…', 'Processing…') : t(locale, 'გადახდა (დემო)', 'Pay (demo)')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
