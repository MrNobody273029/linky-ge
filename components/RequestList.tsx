// components/RequestList.tsx
'use client';

import Image from 'next/image';
import { Button, Card, cn } from '@/components/ui';
import { useMemo, useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock3, Truck, PackageCheck, XCircle, CreditCard } from 'lucide-react';
import { AppLoader } from '@/components/AppLoader';

type Item = {
  id: string;
  title: string;
  productUrl: string;
  status: string;
  paymentStatus: string; // NONE | PARTIAL | FULL
  originalPrice?: number | null;
  currency?: string;
  cancelReason?: string | null;
  offer?: { imageUrl: string; linkyPrice: number; etaDays: number; note?: string | null } | null;
};

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + '…';
}

// ✅ helpers for 50/50 calc (UI only)
function calcPay50(total: number) {
  return Math.ceil(total * 0.5);
}
function calcPayRest(total: number) {
  // remaining after rounding 50% up (so total always matches)
  const p50 = calcPay50(total);
  return Math.max(0, total - p50);
}


export function RequestList({ locale, items }: { locale: string; items: Item[] }) {
  const t = useTranslations('dash');
  const [isPending, startTransition] = useTransition();

  const [openId, setOpenId] = useState<string | null>(null);

  // payment/decline modals
const [payOpenFor, setPayOpenFor] = useState<string | null>(null); // ✅ 50%
const [pay70OpenFor, setPay70OpenFor] = useState<string | null>(null); // ✅ remaining 50%

  const [declineOpenFor, setDeclineOpenFor] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const openReq = useMemo(() => items.find((x) => x.id === openId) ?? null, [items, openId]);

  async function act(body: any) {
    startTransition(async () => {
      const res = await fetch(`/api/requests`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) window.location.reload();
      else alert(j?.error ?? 'Action failed');
    });
  }

  function price(n: number | null | undefined, currency?: string) {
    if (n == null || !Number.isFinite(n)) return '—';
    return `${n} ${currency ?? 'GEL'}`;
  }

  return (
    <>
      {/* ✅ overlay loader while any PATCH/POST action is pending */}
      {isPending ? <AppLoader /> : null}

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[1.2fr_0.7fr_0.9fr_110px] gap-3 border-b border-border px-4 py-3 text-xs font-semibold text-muted md:grid">
          <div>{t('tableTitle')}</div>
          <div>{t('tableStatus')}</div>
          <div>{t('tablePrice')}</div>
          <div className="text-right">{t('tableAction')}</div>
        </div>

        <div className="divide-y divide-border">
          {items.map((r) => {
            const hasOffer = !!r.offer;
            const linky = hasOffer ? r.offer!.linkyPrice : null;
            const isOpen = openId === r.id;

                const total = r.offer?.linkyPrice ?? 0;
                const pay50Amount = r.offer ? calcPay50(total) : 0;
                const payRestAmount = r.offer ? calcPayRest(total) : 0;


            return (
              <div key={r.id} className={cn('relative', isOpen ? 'bg-card/20' : '')}>
                <button
                  onClick={() => setOpenId(isOpen ? null : r.id)}
                  className="w-full text-left hover:bg-card/40"
                >
                  <div className="grid grid-cols-1 gap-2 px-4 py-4 md:grid-cols-[1.2fr_0.7fr_0.9fr_110px] md:items-center md:gap-3 md:py-3">
                    <div className="min-w-0">
                      <div className="font-semibold line-clamp-2">{r.title}</div>
                      <div className="mt-1 text-xs text-muted md:hidden break-all">
                        {truncate(r.productUrl, 80)}
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="flex flex-col gap-1">
                        <span className={badgeByStatus(r.status)}>{t(`status.${r.status}`)}</span>

                        {r.paymentStatus === 'FULL' ? (
                          <span className="inline-flex w-fit rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                            {t('payment.FULL')}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="font-semibold">
                        {linky != null
                          ? price(linky, r.currency)
                          : r.status === 'NEW' || r.status === 'SCOUTING'
                            ? t('calculating')
                            : '—'}
                      </div>
                      {hasOffer && r.originalPrice != null && r.paymentStatus === 'FULL' ? (
                        <div className="text-xs text-muted">
                          {t('saved')}: {Math.max(0, (r.originalPrice ?? 0) - r.offer!.linkyPrice)} {r.currency ?? 'GEL'}
                        </div>
                      ) : null}

                    </div>

                    <div className="md:text-right">
                      <span className="inline-flex rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold">
                        {isOpen ? t('closeRow') : t('openRow')}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Dropdown details */}
                {isOpen ? (
                  <div className="border-t border-border bg-card/20 px-4 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
                      <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-border bg-card/40">
                        {r.offer?.imageUrl ? (
                          <Image src={r.offer.imageUrl} alt={r.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                            {t('noImage')}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={badgeByStatus(r.status)}>{t(`status.${r.status}`)}</span>

                          {r.paymentStatus === 'FULL' ? (
                            <span className="inline-flex rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                              {t('payment.FULL')}
                            </span>
                          ) : null}

                          <a
                            href={r.productUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted hover:underline"
                          >
                            {t('openOriginal')}: {truncate(r.productUrl, 60)}
                          </a>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Info label={t('origPrice')} value={price(r.originalPrice ?? null, r.currency)} />
                          <Info label={t('linkyPrice')} value={r.offer ? price(r.offer.linkyPrice, r.currency) : '—'} />
                          <Info label={t('eta')} value={r.offer ? `${r.offer.etaDays} ${t('days')}` : '—'} />
                          <Info label={t('paymentLabel')} value={t(`payment.${r.paymentStatus}`)} />
                        </div>

                        {r.offer?.note ? (
                          <div className="rounded-2xl border border-border bg-card/30 p-3 text-sm text-muted">
                            {r.offer.note}
                          </div>
                        ) : null}

                        {/* OFFERED: open pay30 modal or decline */}
                        {r.status === 'OFFERED' ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                              variant="secondary"
                              disabled={isPending}
                              onClick={(e) => {
                                e.preventDefault();
                                setDeclineReason('');
                                setDeclineOpenFor(r.id);
                              }}
                            >
                              {t('decline')}
                            </Button>

                            <Button
                              disabled={isPending}
                              onClick={(e) => {
                                e.preventDefault();
                                setPayOpenFor(r.id); // ✅ open popup first
                              }}
                            >
                              {t('acceptOffer')}
                            </Button>
                          </div>
                        ) : null}

                        {/* ARRIVED: open pay70 modal first */}
                        {r.status === 'ARRIVED' ? (
                          <div className="rounded-2xl border border-border bg-card/30 p-4">
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <CreditCard className="h-5 w-5" />
                              {t('finalPaymentTitle')}
                            </div>

                            <div className="mt-2 text-sm text-muted">
                              {r.paymentStatus === 'FULL' ? t('fullyPaid') : t('needFinalPayment')}
                            </div>

                            <div className="mt-3 flex justify-end">
                              <Button
                                disabled={isPending || r.paymentStatus === 'FULL'}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPay70OpenFor(r.id); // ✅ popup, not direct pay
                                }}
                              >
                            {r.paymentStatus === 'FULL' ? t('paid') : t('pay70Demo')}
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {/* In progress: show delivery steps + locked 50% */}
                        {['PAID_PARTIALLY', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status) ? (
                          <div className="rounded-2xl border border-border bg-card/20 p-4">
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <Truck className="h-5 w-5" />
                              {t('deliveryProgress')}
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                              <Step active icon={<CheckCircle2 className="h-4 w-4" />} label={t('stepAccepted')} />
                              <Step
                                active={r.status === 'IN_PROGRESS'}
                                icon={<Truck className="h-4 w-4" />}
                                label={t('stepInTransit')}
                              />
                              <Step active={false} icon={<PackageCheck className="h-4 w-4" />} label={t('stepArrived')} />
                              <Step active={false} icon={<Clock3 className="h-4 w-4" />} label={t('stepDelivered')} />
                            </div>

                            <div className="mt-3 text-xs text-muted">{t('finalPaymentLocked50')}</div>

                            <div className="mt-3 flex justify-end">
                              <Button variant="secondary" disabled>
                                {t('pay50Locked')}
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {/* Cancelled/Declined/Expired reason */}
                        {['DECLINED', 'EXPIRED', 'CANCELLED'].includes(r.status) ? (
                          <div className="rounded-2xl border border-border bg-card/30 p-4">
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <XCircle className="h-5 w-5" />
                              {t('cancelledTitle')}
                            </div>
                            {r.cancelReason ? (
                              <div className="mt-2 text-sm text-muted">{r.cancelReason}</div>
                            ) : (
                              <div className="mt-2 text-sm text-muted">{t('noReason')}</div>
                            )}
                          </div>
                        ) : null}

                        {/* Completed */}
                        {r.status === 'COMPLETED' ? (
                          <div className="rounded-2xl border border-border bg-success/10 p-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-success">
                              <CheckCircle2 className="h-5 w-5" />
                              {t('delivered')}
                            </div>
                            <div className="mt-2 text-sm text-muted">{t('deliveredSubtitle')}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* ✅ PAY 30 MODAL (popup before action) */}
                    {payOpenFor === r.id ? (
                      <Modal title={t('pay50Title')} subtitle={t('pay50Subtitle')} onClose={() => setPayOpenFor(null)}>
                        <div className="grid grid-cols-2 gap-3">
                          <Info
                            label={t('linkyPrice')}
                            value={r.offer ? `${r.offer.linkyPrice} ${r.currency ?? 'GEL'}` : '—'}
                          />
                          <Info
                            label={t('pay50Amount')}
                            value={r.offer ? `${pay50Amount} ${r.currency ?? 'GEL'}` : '—'}
                          />
                        </div>

                        <div className="mt-3 rounded-2xl border border-border bg-card/30 p-3 text-sm text-muted">
                         {locale === 'ka'
                            ? 'ეს არის წინასწარი 50% — შეკვეთის დასადასტურებლად. დარჩენილი თანხა გადაიხდება როცა შეკვეთა ჩამოვა.'
                            : 'This is a 50% prepayment to confirm the order. The remaining amount is paid after the order arrives.'}

                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => setPayOpenFor(null)}>
                            {t('close')}
                          </Button>
                          <Button
                            disabled={isPending || !r.offer}
                            onClick={() => {
                              setPayOpenFor(null);
                            act({ id: r.id, action: 'pay50' });
                            }}
                          >
                            {t('payDemo')}
                          </Button>
                        </div>
                      </Modal>
                    ) : null}

                    {/* ✅ PAY 70 MODAL (popup before action) */}
                    {pay70OpenFor === r.id ? (
                      <Modal title={t('pay70Title')} subtitle={t('pay70Body')} onClose={() => setPay70OpenFor(null)}>
                        <div className="grid grid-cols-2 gap-3">
                          <Info
                            label={t('linkyPrice')}
                            value={r.offer ? `${r.offer.linkyPrice} ${r.currency ?? 'GEL'}` : '—'}
                          />
                          <Info
                            label={locale === 'ka' ? 'დარჩენილი 50%' : 'Remaining 50%'}
                            value={r.offer ? `${payRestAmount} ${r.currency ?? 'GEL'}` : '—'}
                          />

                        </div>

                        <div className="mt-3 rounded-2xl border border-border bg-card/30 p-3 text-sm text-muted">
                          {locale === 'ka'
                            ? 'ეს არის დარჩენილი თანხა. გადახდის შემდეგ შეკვეთა მალე ჩაბარდება შენს მითითებულ მისამართზე.'
                            : 'This is the remaining amount. After payment, your order will be delivered to your provided address soon.'}
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => setPay70OpenFor(null)}>
                            {t('close')}
                          </Button>
                          <Button
                            disabled={isPending || r.paymentStatus === 'FULL' || !r.offer}
                            onClick={() => {
                              setPay70OpenFor(null);
                                act({ id: r.id, action: 'pay50_rest' });
                            }}
                          >
                            {t('payNow')}
                          </Button>
                        </div>
                      </Modal>
                    ) : null}

                    {/* DECLINE MODAL */}
                    {declineOpenFor === r.id ? (
                      <Modal
                        title={t('declineTitle')}
                        subtitle={t('declineSubtitle')}
                        onClose={() => setDeclineOpenFor(null)}
                      >
                        <textarea
                          className="h-28 w-full rounded-2xl border border-border bg-card/40 p-3 text-sm outline-none"
                          placeholder={t('declinePh')}
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          maxLength={500}
                        />
                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => setDeclineOpenFor(null)}>
                            {t('close')}
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={isPending}
                            onClick={() => {
                              setDeclineOpenFor(null);
                              act({ id: r.id, action: 'decline', reason: declineReason });
                            }}
                          >
                            {t('confirmDecline')}
                          </Button>
                        </div>
                      </Modal>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}

          {items.length === 0 ? <div className="px-4 py-10 text-center text-sm text-muted">{t('empty')}</div> : null}
        </div>
      </Card>
    </>
  );
}

function badgeByStatus(status: string) {
  if (status === 'NEW' || status === 'SCOUTING')
    return 'inline-flex rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning';
  if (status === 'OFFERED')
    return 'inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent';
  if (['ACCEPTED', 'PAID_PARTIALLY', 'IN_PROGRESS', 'ARRIVED'].includes(status))
    return 'inline-flex rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success';
  if (status === 'COMPLETED')
    return 'inline-flex rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success';
  return 'inline-flex rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted border border-border';
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-3">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Step({ active, icon, label }: { active: boolean; icon: ReactNode; label: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border border-border px-3 py-2',
        active ? 'bg-card/50' : 'bg-card/20 text-muted'
      )}
    >
      <span className={cn(active ? '' : 'opacity-60')}>{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  children,
  onClose
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6"
      onClick={onClose}
    >
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <Card className="overflow-hidden p-4 md:p-5">
          <div className="text-lg font-black">{title}</div>
          {subtitle ? <div className="mt-1 text-sm text-muted">{subtitle}</div> : null}
          <div className="mt-4">{children}</div>
        </Card>
      </div>
    </div>
  );
}
