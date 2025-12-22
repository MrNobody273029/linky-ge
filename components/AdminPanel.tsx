// components/AdminPanel.tsx
'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { Button, Card, Input, cn } from '@/components/ui';
import { AppLoader } from '@/components/AppLoader';
import { useTranslations } from 'next-intl';

type TabKey = 'new' | 'offered' | 'accepted' | 'completed' | 'cancelled';

type Req = {
  id: string;
  createdAt: string;
  title: string;
  productUrl: string;
  status: string;

  // ✅ added (needed for "fully paid" badge)
  paymentStatus: 'NONE' | 'PARTIAL' | 'FULL';

  originalPrice: number | null;
  currency: string;
  cancelReason: string | null;
  user: { username: string; email: string; phone: string; fullAddress: string };
  offer: null | {
    imageUrl: string;
    linkyPrice: number;
    etaDays: number;
    note: string | null;
    offeredAt: string;
    adminSourceUrl: string | null; // ✅ admin-only
  };
};

function inTab(r: Req, tab: TabKey) {
  if (tab === 'new') return r.status === 'NEW' || r.status === 'SCOUTING';
  if (tab === 'offered') return r.status === 'OFFERED';
  if (tab === 'accepted') return ['ACCEPTED', 'PAID_PARTIALLY', 'IN_PROGRESS', 'ARRIVED'].includes(r.status);
  if (tab === 'completed') return r.status === 'COMPLETED';
  return ['DECLINED', 'EXPIRED', 'CANCELLED'].includes(r.status);
}

function daysLeft(offeredAtISO: string) {
  const offeredAt = new Date(offeredAtISO).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - offeredAt) / 86400000);
  const left = 7 - diffDays;
  return Math.max(0, left);
}

// ✅ tiny helper (no translation file change needed)
function paidBadgeText(locale: string) {
  return locale === 'ka' ? 'გადახდილია სრულად' : 'Fully paid';
}

export function AdminPanel({ locale, tab, requests }: { locale: string; tab: string; requests: Req[] }) {
  const t = useTranslations('admin');

  // ✅ needed ONLY to show loader while any transition is pending
  const [isPending] = useTransition();

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'new', label: t('tabs.new') },
    { key: 'offered', label: t('tabs.offered') },
    { key: 'accepted', label: t('tabs.accepted') },
    { key: 'completed', label: t('tabs.completed') },
    { key: 'cancelled', label: t('tabs.cancelled') }
  ];

  const activeTab = (tabs.find((x) => x.key === tab) ? tab : 'new') as TabKey;

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { new: 0, offered: 0, accepted: 0, completed: 0, cancelled: 0 };
    for (const r of requests) {
      for (const k of Object.keys(c) as TabKey[]) if (inTab(r, k)) c[k] += 1;
    }
    return c;
  }, [requests]);

  const list = useMemo(() => requests.filter((r) => inTab(r, activeTab)), [requests, activeTab]);

  const [openId, setOpenId] = useState<string | null>(null);
  const openReq = useMemo(() => list.find((x) => x.id === openId) ?? null, [list, openId]);

  return (
    <>
      {isPending ? <AppLoader /> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <Card className="p-4 md:p-5">
          <div className="text-lg font-black">{t('title')}</div>
          <div className="mt-1 text-sm text-muted">{t('subtitle')}</div>

          <div className="mt-5 space-y-2">
            {tabs.map((x) => {
              const isActive = x.key === activeTab;
              return (
                <a
                  key={x.key}
                  href={`/${locale}/admin?tab=${x.key}`}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold',
                    isActive ? 'bg-card/70 text-fg border border-border' : 'text-muted hover:bg-card/40'
                  )}
                >
                  <span>{x.label}</span>
                  <span
                    className={cn(
                      'min-w-[28px] rounded-full px-2 py-0.5 text-xs font-bold text-center',
                      isActive ? 'bg-accent text-black' : 'bg-card/60 text-muted'
                    )}
                  >
                    {counts[x.key]}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted">{t('hint')}</div>
        </Card>

        {/* Main list */}
        <div className="space-y-4">
          <Card className="p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-black">{tabs.find((x) => x.key === activeTab)?.label}</div>
                <div className="mt-1 text-sm text-muted">{t('listSubtitle')}</div>
              </div>
              <div className="text-xs text-muted">{t('count', { n: list.length })}</div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1.2fr_0.9fr_0.7fr_0.8fr_110px] gap-3 border-b border-border px-4 py-3 text-xs font-semibold text-muted md:grid">
              <div>{t('table.title')}</div>
              <div>{t('table.user')}</div>
              <div>{t('table.status')}</div>
              <div>{t('table.time')}</div>
              <div className="text-right">{t('table.action')}</div>
            </div>

            <div className="divide-y divide-border">
              {list.slice(0, 15).map((r) => (
                <button key={r.id} onClick={() => setOpenId(r.id)} className="w-full text-left hover:bg-card/40">
                  <div className="grid grid-cols-1 gap-2 px-4 py-4 md:grid-cols-[1.2fr_0.9fr_0.7fr_0.8fr_110px] md:items-center md:gap-3 md:py-3">
                    <div>
                      <div className="font-semibold">{r.title}</div>
                      <div className="mt-1 text-xs text-muted break-all md:hidden">{r.productUrl}</div>
                      {activeTab === 'offered' && r.offer?.offeredAt ? (
                        <div className="mt-1 text-xs text-muted">{t('offeredLeft', { n: daysLeft(r.offer.offeredAt) })}</div>
                      ) : null}
                    </div>

                    <div className="text-sm">
                      <div className="font-semibold">{r.user.username}</div>
                      <div className="text-xs text-muted">{r.user.email}</div>
                    </div>

                    {/* ✅ STATUS + (UNDER IT) fully-paid badge */}
                    <div className="text-sm">
                      <div className="flex flex-col gap-1">
                        <span className={badge(r.status)}>{statusLabel(t, r.status)}</span>

                        {r.paymentStatus === 'FULL' ? (
                          <span className="inline-flex w-fit rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                            {paidBadgeText(locale)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-sm text-muted">{formatDate(r.createdAt)}</div>

                    <div className="md:text-right">
                      <span className="inline-flex rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold">
                        {t('open')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {list.length === 0 ? <div className="px-4 py-10 text-center text-sm text-muted">{t('empty')}</div> : null}

              {list.length > 15 ? (
                <div className="px-4 py-3 text-xs text-muted">{t('showing', { n: 15, total: list.length })}</div>
              ) : null}
            </div>
          </Card>

          {openReq ? <OrderModal locale={locale} tab={activeTab} req={openReq} onClose={() => setOpenId(null)} /> : null}
        </div>
      </div>
    </>
  );
}

function OrderModal({ locale, tab, req, onClose }: { locale: string; tab: TabKey; req: Req; onClose: () => void }) {
  const t = useTranslations('admin');
  const [isPending, startTransition] = useTransition();

  const canEditOffer = tab === 'new';
  const canProgress = tab === 'accepted';

  // ✅ NEW -> SCOUTING when modal opens (once)
  useEffect(() => {
    if (req.status !== 'NEW') return;
    fetch(`/api/admin/scout`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requestId: req.id })
    }).catch(() => {});
    // intentionally no reload — UI can update on next refresh
  }, [locale, req.id, req.status]);

  const [geoPrice, setGeoPrice] = useState(req.originalPrice ? String(req.originalPrice) : '');
  const [linkyPrice, setLinkyPrice] = useState(req.offer ? String(req.offer.linkyPrice) : '');
  const [etaDays, setEtaDays] = useState(req.offer ? String(req.offer.etaDays) : '7');
  const [note, setNote] = useState(req.offer?.note ?? '');
  const [adminSourceUrl, setAdminSourceUrl] = useState(req.offer?.adminSourceUrl ?? '');
  const [file, setFile] = useState<File | null>(null);

  // ✅ show all options but lock invalid ones (prevents "only 1 option" confusion)
  const progressOptions = useMemo(() => {
    if (!canProgress) return [];

    const status = req.status;
    const canToInProgress = status === 'ACCEPTED' || status === 'PAID_PARTIALLY';
    const canToArrived = status === 'IN_PROGRESS';
    const canToCompleted = status === 'ARRIVED';

    const opts = [
      { value: 'IN_PROGRESS' as const, enabled: canToInProgress },
      { value: 'ARRIVED' as const, enabled: canToArrived },
      { value: 'COMPLETED' as const, enabled: canToCompleted }
    ];

    return opts;
  }, [canProgress, req.status]);

  const firstEnabled = useMemo(() => progressOptions.find((x) => x.enabled)?.value ?? '', [progressOptions]);
  const [nextStatus, setNextStatus] = useState<(typeof progressOptions)[number]['value'] | ''>(firstEnabled);

  // keep selection valid if req/status changes
  useEffect(() => {
    const stillValid = progressOptions.some((x) => x.value === nextStatus && x.enabled);
    if (!stillValid) setNextStatus(firstEnabled);
  }, [firstEnabled, nextStatus, progressOptions]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert(t('copied'));
    } catch {
      alert(text);
    }
  }

  async function saveOffer() {
    const fd = new FormData();
    fd.append('requestId', req.id);
    fd.append('originalPrice', geoPrice);
    fd.append('linkyPrice', linkyPrice);
    fd.append('etaDays', etaDays);
    fd.append('note', note);
    fd.append('adminSourceUrl', adminSourceUrl);
    if (file) fd.append('image', file);

    startTransition(async () => {
      const res = await fetch(`/api/admin/offer`, { method: 'POST', body: fd });
      const j = await res.json().catch(() => ({}));
      if (res.ok) window.location.reload();
      else alert(j?.error ? String(j.error) : JSON.stringify(j, null, 2));
    });
  }

  async function progressStatus() {
    if (!nextStatus) return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ requestId: req.id, status: nextStatus })
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) window.location.reload();
      else alert(j?.error ?? 'Failed');
    });
  }

  const offerSource = req.offer?.adminSourceUrl?.trim() || '';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6">
      {isPending ? <AppLoader /> : null}

      <div className="w-full max-w-4xl">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4 md:p-5">
            <div className="min-w-0">
              <div className="text-lg font-black">{t('modal.title')}</div>

              {/* ✅ status line + (UNDER IT) fully-paid badge */}
              <div className="mt-1 text-xs text-muted">
                <div className="flex flex-col gap-1">
                  <div>
                    {t('modal.status')}: <span className="font-semibold text-fg">{statusLabel(t, req.status)}</span>
                    {tab === 'offered' && req.offer?.offeredAt ? (
                      <> • {t('offeredLeft', { n: daysLeft(req.offer.offeredAt) })}</>
                    ) : null}
                  </div>

                  {req.paymentStatus === 'FULL' ? (
                    <span className="inline-flex w-fit rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                      {paidBadgeText(locale)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={req.productUrl}
                target="_blank"
                className="hidden rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-semibold hover:bg-card/80 md:inline-flex"
              >
                {t('openLink')}
              </a>
              <Button variant="secondary" onClick={onClose}>
                {t('close')}
              </Button>
            </div>
          </div>

          <div className="max-h-[80vh] overflow-auto p-4 md:p-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow label={t('user.username')} value={req.user.username} />
              <InfoRow label={t('user.email')} value={req.user.email} />
              <InfoRow label={t('user.phone')} value={req.user.phone} />
              <InfoRow label={t('user.address')} value={req.user.fullAddress} full />
            </div>

            {/* product link */}
            <div className="mt-4 flex items-center gap-2">
              <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card/40 px-4 py-3">
                <div className="text-xs font-semibold text-muted">{t('productLink')}</div>
                <div className="mt-1 truncate text-sm font-semibold" title={req.productUrl}>
                  {req.productUrl}
                </div>
              </div>
              <Button variant="secondary" className="h-12 shrink-0 px-4" onClick={() => copy(req.productUrl)}>
                {t('copy')}
              </Button>
            </div>

            {/* ✅ Cancel reason (already supported) */}
            {req.cancelReason ? (
              <div className="mt-5 rounded-2xl border border-border bg-card/50 p-4">
                <div className="text-xs font-semibold text-muted">{t('cancelReason')}</div>
                <div className="mt-1 text-sm">{req.cancelReason}</div>
              </div>
            ) : null}

            {/* ✅ Offer snapshot (if offer exists) */}
            {req.offer ? (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
                <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-border bg-card/40 md:h-44">
                  {req.offer.imageUrl ? <Image src={req.offer.imageUrl} alt={req.title} fill className="object-cover" /> : null}
                </div>

                <div className="rounded-2xl border border-border bg-card/40 p-4">
                  <div className="text-sm font-bold">{t('offerSnapshot')}</div>

                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-muted">{t('offerForm.geoPrice')}</div>
                      <div className="mt-1 font-semibold">
                        {req.originalPrice ?? '—'} {req.currency}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted">{t('offerForm.linkyPrice')}</div>
                      <div className="mt-1 font-semibold">
                        {req.offer.linkyPrice} {req.currency}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted">{t('offerForm.etaDays')}</div>
                      <div className="mt-1 font-semibold">{req.offer.etaDays}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted">{t('offeredAt')}</div>
                      <div className="mt-1 font-semibold">{formatDate(req.offer.offeredAt)}</div>
                    </div>
                  </div>

                  {req.offer.note ? <div className="mt-3 text-sm text-muted">{req.offer.note}</div> : null}

                  {/* ✅ ALWAYS show adminSourceUrl block (even empty) in ALL tabs */}
                  <div className="mt-4 rounded-2xl border border-border bg-card/30 p-3">
                    <div className="text-xs font-semibold text-muted">{t('offerForm.adminSourceUrl')}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="min-w-0 flex-1 truncate text-sm font-semibold" title={offerSource || '—'}>
                        {offerSource || '—'}
                      </div>
                      <Button
                        variant="secondary"
                        className="h-10 px-3"
                        onClick={() => copy(offerSource)}
                        disabled={!offerSource}
                        title={!offerSource ? 'Empty' : undefined}
                      >
                        {t('copy')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* FORM only on NEW tab */}
            {canEditOffer ? (
              <div className="mt-6 rounded-2xl border border-border bg-card/30 p-4 md:p-5">
                <div className="text-lg font-black">{t('offerForm.title')}</div>
                <div className="mt-1 text-sm text-muted">{t('offerForm.subtitle')}</div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-muted">{t('offerForm.geoPrice')}</div>
                    <Input value={geoPrice} onChange={(e) => setGeoPrice(e.target.value)} placeholder="e.g. 2999" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted">{t('offerForm.linkyPrice')}</div>
                    <Input value={linkyPrice} onChange={(e) => setLinkyPrice(e.target.value)} placeholder="e.g. 2190" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted">{t('offerForm.etaDays')}</div>
                    <Input value={etaDays} onChange={(e) => setEtaDays(e.target.value)} placeholder="e.g. 7" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted">{t('offerForm.image')}</div>
                    <input
                      className="mt-2 w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-muted">{t('offerForm.adminSourceUrl')}</div>
                    <Input
                      value={adminSourceUrl}
                      onChange={(e) => setAdminSourceUrl(e.target.value)}
                      placeholder={t('offerForm.adminSourceUrlPh')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-muted">{t('offerForm.note')}</div>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('offerForm.notePh')} />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Button disabled={isPending} onClick={saveOffer} className="h-12 px-6">
                    {t('offerForm.save')}
                  </Button>
                </div>

                <p className="mt-3 text-xs text-muted">{t('offerForm.help')}</p>
              </div>
            ) : null}

            {/* STATUS PROGRESSION only on ACCEPTED tab */}
            {canProgress ? (
              <div className="mt-6 rounded-2xl border border-border bg-card/30 p-4 md:p-5">
                <div className="text-lg font-black">{t('progress.title')}</div>
                <div className="mt-1 text-sm text-muted">{t('progress.subtitle')}</div>

                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="w-full md:max-w-sm">
                    <div className="text-xs font-semibold text-muted">{t('progress.next')}</div>

                    <select
                      className="mt-2 h-12 w-full rounded-xl border border-border bg-card/70 px-4 text-sm outline-none"
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value as any)}
                      disabled={progressOptions.length === 0 || !progressOptions.some((x) => x.enabled)}
                    >
                      {progressOptions.length === 0 ? (
                        <option value="">{t('progress.none')}</option>
                      ) : (
                        progressOptions.map((o) => (
                          <option key={o.value} value={o.value} disabled={!o.enabled}>
                            {statusLabel(t, o.value)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <Button
                    disabled={isPending || !nextStatus || !progressOptions.some((x) => x.value === nextStatus && x.enabled)}
                    onClick={progressStatus}
                    className="h-12 px-6"
                  >
                    {t('progress.save')}
                  </Button>
                </div>
              </div>
            ) : null}

            {tab !== 'new' && tab !== 'accepted' ? (
              <div className="mt-6 rounded-2xl border border-border bg-card/20 p-4 text-sm text-muted">{t('readOnly')}</div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card/40 p-4', full ? 'md:col-span-2' : '')}>
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function badge(status: string) {
  if (status === 'NEW' || status === 'SCOUTING')
    return 'inline-flex rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning';
  if (status === 'OFFERED')
    return 'inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent';
  if (status === 'ACCEPTED' || status === 'PAID_PARTIALLY' || status === 'IN_PROGRESS' || status === 'ARRIVED')
    return 'inline-flex rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success';
  if (status === 'COMPLETED')
    return 'inline-flex rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success';
  return 'inline-flex rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted border border-border';
}

function statusLabel(t: any, status: string) {
  const key = `status.${status}`;
  const fallback = status;
  try {
    const v = t(key);
    return v || fallback;
  } catch {
    return fallback;
  }
}
