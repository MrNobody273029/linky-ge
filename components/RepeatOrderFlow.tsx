'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';

type Props = {
  locale: string;
  sourceRequestId: string;
  isAuthed: boolean;

  /**
   * variant:
   * - "button": renders main CTA button (like on the page)
   * You can extend later if you want link / icon etc.
   */
  variant?: 'button';
};

function calcPay50(total: number) {
  return Math.ceil(total * 0.5);
}

export function RepeatOrderFlow({ locale, sourceRequestId, isAuthed, variant = 'button' }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // ✅ PREVIEW popup (authed)
  const [payOpen, setPayOpen] = useState(false);

  // ✅ Guest popup (not authed)
  const [authOpen, setAuthOpen] = useState(false);

  // You said modal uses: pay50Total = linkyPrice
  // On this page we don't need to show linkyPrice itself from API,
  // so pay50 preview shows "50% amount" based on a placeholder total.
  // But we CAN keep identical UX by only showing 50% amount after API returns SHOW_PAY50.
  // For now: match your current flow exactly -> open preview first, then confirm triggers POST.
  // So we keep a "total" concept, but we don't have linkyPrice in props.
  // To keep it 100% consistent, we'll call POST first to get linkyPrice/currency,
  // then show pay popup with those values.

  const [pay50Total, setPay50Total] = useState<number | null>(null);
  const [payCurrency, setPayCurrency] = useState<string | null>(null);

  const pay50Amount = useMemo(() => (pay50Total != null ? calcPay50(pay50Total) : null), [pay50Total]);

  function openOrderFlow(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (!sourceRequestId) {
      alert(locale === 'ka' ? 'აკლია sourceRequestId' : 'Missing sourceRequestId');
      return;
    }

    if (!isAuthed) {
      setAuthOpen(true);
      return;
    }

    // ✅ Authed: first call repeat API to get SHOW_PAY50 data (price/currency),
    // then open pay popup.
    void preparePay50();
  }

  async function preparePay50() {
    setLoading(true);
    try {
      const res = await fetch('/api/requests/repeat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceRequestId })
      });

      const txt = await res.text();
      const j = txt ? JSON.parse(txt) : {};

      if (!res.ok) {
        alert((j as any)?.error ?? (locale === 'ka' ? 'ვერ შესრულდა' : 'Action failed'));
        return;
      }

      // expired -> redirect flow identical to your modal
      if ((j as any)?.mode === 'NEW_REQUEST') {
        alert(
          locale === 'ka'
            ? 'შეთავაზებას გაუვიდა ვადა. გაგზავნილია ახალი მოთხოვნა.'
            : 'The offer has expired. A new request was sent.'
        );
        window.location.href = `/${locale}/mypage?tab=pending`;
        return;
      }

      // show pay50
      if ((j as any)?.mode === 'SHOW_PAY50') {
        const total = Number((j as any)?.linkyPrice ?? 0);
        const cur = String((j as any)?.currency ?? '');
        setPay50Total(Number.isFinite(total) ? total : 0);
        setPayCurrency(cur || null);
        setPayOpen(true);
        return;
      }

      // unknown mode -> safe fallback
      setPayOpen(true);
    } catch (err: any) {
      alert(err?.message ?? (locale === 'ka' ? 'ქსელის შეცდომა' : 'Network error'));
    } finally {
      setLoading(false);
    }
  }

  async function confirmPay50() {
    // In your backend, POST already created the OFFERED repeat request
    // and returns SHOW_PAY50. You then mark payment elsewhere later.
    // But your current modal: POST immediately, then redirects to inProgress.
    // You asked: "as in modal". In your modal code you redirect after POST success.
    // However your route currently returns SHOW_PAY50 and does NOT mark PAID_PARTIALLY.
    // In your modal, confirmPay50 is still doing POST and then redirecting.
    // We'll keep that behavior exactly: call POST again is not ideal.
    // So instead: on confirm, just redirect to /mypage?tab=inProgress
    // BUT only if you actually have a payment patch route later.
    // To mirror your current modal 1:1, we call POST again (same as modal) and redirect.

    if (!sourceRequestId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/requests/repeat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceRequestId })
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

  if (variant !== 'button') return null;

  return (
    <>
      <Button onClick={openOrderFlow} disabled={loading} className="bg-accent text-black hover:bg-accent/90">
        {loading
          ? locale === 'ka'
            ? 'იგზავნება…'
            : 'Processing…'
          : locale === 'ka'
            ? 'შეუკვეთე შენც'
            : 'Order yours'}
      </Button>

      {/* ✅ GUEST POPUP */}
      {authOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6"
          onClick={() => setAuthOpen(false)}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="overflow-hidden p-4 md:p-5">
              <div className="text-lg font-black">
                {locale === 'ka' ? 'ავტორიზაცია საჭიროა' : 'Authorization required'}
              </div>

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

      {/* ✅ PAY 50 PREVIEW POPUP */}
      {payOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6"
          onClick={() => !loading && setPayOpen(false)}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="overflow-hidden p-4 md:p-5">
              <div className="text-lg font-black">
                {locale === 'ka' ? 'წინასწარი გადახდის დადასტურება' : 'Confirm prepayment'}
              </div>

              <div className="mt-1 text-sm text-muted">
                {locale === 'ka'
                  ? 'შეთავაზების დასადასტურებლად საჭიროა 50%-ის გადახდა.'
                  : 'To accept this offer you need to pay 50% upfront.'}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-card/40 p-3">
                  <div className="text-xs font-semibold text-muted">
                    {locale === 'ka' ? 'Linky ფასი' : 'Linky price'}
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {pay50Total != null ? pay50Total : '—'} {payCurrency ?? ''}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card/40 p-3">
                  <div className="text-xs font-semibold text-muted">
                    {locale === 'ka' ? '50%-ის თანხა' : '50% amount'}
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {pay50Amount != null ? pay50Amount : '—'} {payCurrency ?? ''}
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
                  {loading
                    ? locale === 'ka'
                      ? 'იგზავნება…'
                      : 'Processing…'
                    : locale === 'ka'
                      ? 'გადახდა (დემო)'
                      : 'Pay (demo)'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
