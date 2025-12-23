// app/[locale]/mypage/page.tsx
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, cn } from '@/components/ui';
import { QuickRequestBar } from '@/components/QuickRequestBar';
import { RequestList } from '@/components/RequestList';
import { ProfileCard } from '@/components/ProfileCard';

type TabKey = 'pending' | 'offers' | 'inProgress' | 'cancelled' | 'completed';

function normalizeTab(v: any): TabKey {
  const t = String(v || '').trim();
  if (t === 'offers' || t === 'inProgress' || t === 'cancelled' || t === 'completed') return t;
  return 'pending';
}

export default async function MyPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams?: { tab?: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'dash' });

  const user = await getCurrentUser();
  if (!user) redirect(`/${params.locale}/login?next=/${params.locale}/mypage`);

  // ✅ admins should not have mypage
  if (user.role === 'ADMIN') redirect(`/${params.locale}/admin`);

  // ✅ fetch fresh user data + cooldown timestamps
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      username: true,
      fullAddress: true,
      phone: true,
      addressUpdatedAt: true,
      phoneUpdatedAt: true,
      passwordUpdatedAt: true
    }
  });
  if (!dbUser) redirect(`/${params.locale}/login?next=/${params.locale}/mypage`);

  const tab = normalizeTab(searchParams?.tab);

  const requests = await prisma.request.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { offer: true }
  });

  const counts = {
    pending: requests.filter((r) => r.status === 'NEW' || r.status === 'SCOUTING').length,
    offers: requests.filter((r) => r.status === 'OFFERED' || r.status === 'NOT_FOUND').length,
    inProgress: requests.filter((r) => ['ACCEPTED', 'PAID_PARTIALLY', 'IN_PROGRESS', 'ARRIVED'].includes(r.status))
      .length,
    cancelled: requests.filter((r) => ['DECLINED', 'CANCELLED', 'EXPIRED'].includes(r.status)).length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length
  };

  const filtered = requests.filter((r) => {
    if (tab === 'pending') return r.status === 'NEW' || r.status === 'SCOUTING';
    if (tab === 'offers') return r.status === 'OFFERED' || r.status === 'NOT_FOUND';
    if (tab === 'inProgress') return ['ACCEPTED', 'PAID_PARTIALLY', 'IN_PROGRESS', 'ARRIVED'].includes(r.status);
    if (tab === 'cancelled') return ['DECLINED', 'CANCELLED', 'EXPIRED'].includes(r.status);
    if (tab === 'completed') return r.status === 'COMPLETED';
    return true;
  });

  const completedCount = counts.completed;

  // ✅ FIX: active must be ONLY pending + offers + inProgress (as you said)
  const activeCount = counts.pending + counts.offers + counts.inProgress;

  const totalSaved = requests.reduce((sum, r) => {
    if (r.paymentStatus !== 'FULL') return sum; // ✅ მხოლოდ სრულად გადახდილზე
    if (!r.offer || r.originalPrice == null) return sum;

    const orig = Number(r.originalPrice);
    const linky = Number(r.offer.linkyPrice);
    if (!Number.isFinite(orig) || !Number.isFinite(linky)) return sum;

    return sum + Math.max(0, orig - linky);
  }, 0);

  const items = filtered.map((r) => ({
    id: r.id,
    title: r.titleHint ?? t('productRequest'),
    productUrl: r.productUrl,
    status: r.status,
    paymentStatus: (r as any).paymentStatus ?? 'NONE',
    originalPrice: r.originalPrice == null ? null : Number(r.originalPrice),
    currency: r.currency,
    cancelReason: r.cancelReason ?? null,
    offer: r.offer
      ? {
          imageUrl: r.offer.imageUrl,
          linkyPrice: Number(r.offer.linkyPrice),
          etaDays: r.offer.etaDays,
          note: r.offer.note
        }
      : null
  }));

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: 'pending', label: t('tabsPending'), count: counts.pending },
    { key: 'offers', label: t('tabsOffers'), count: counts.offers },
    { key: 'inProgress', label: t('tabsInProgress'), count: counts.inProgress },
    { key: 'cancelled', label: t('tabsCancelled'), count: counts.cancelled },
    { key: 'completed', label: t('tabsCompleted'), count: counts.completed }
  ];

  return (
    <div className="container py-6 md:py-8">
      {/* ✅ compact inline bar UNDER NavBar */}
      <div className="mb-6 rounded-3xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="text-lg font-black">{t('findBetter')}</div>
            <div className="mt-1 text-xs text-muted">{t('productRequest')}</div>
          </div>

          <div className="w-full md:max-w-[520px]">
            <QuickRequestBar locale={params.locale} variant="inline" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* LEFT: user card + stats */}
        <div className="space-y-6">
          {/* ✅ Profile card with edit icon + modal */}
          <ProfileCard
            locale={params.locale}
            username={dbUser.username}
            fullAddress={dbUser.fullAddress}
            phone={dbUser.phone}
            addressUpdatedAt={dbUser.addressUpdatedAt ? dbUser.addressUpdatedAt.toISOString() : null}
            phoneUpdatedAt={dbUser.phoneUpdatedAt ? dbUser.phoneUpdatedAt.toISOString() : null}
            passwordUpdatedAt={dbUser.passwordUpdatedAt ? dbUser.passwordUpdatedAt.toISOString() : null}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="p-4 md:p-6">
              <div className="text-xs font-semibold text-muted">{t('totalSaved')}</div>
              <div className="mt-2 text-4xl font-black">
                {totalSaved} <span className="text-base font-bold text-muted">GEL</span>
              </div>
            </Card>

            <Card className="p-4 md:p-6">
              <div className="text-xs font-semibold text-muted">{t('activeRequests')}</div>
              <div className="mt-2 text-4xl font-black">{activeCount}</div>
            </Card>

            <Card className="p-4 md:p-6">
              <div className="text-xs font-semibold text-muted">{t('completed')}</div>
              <div className="mt-2 text-4xl font-black">{completedCount}</div>
            </Card>
          </div>
        </div>

        {/* RIGHT: top tabs + orders directly under them */}
        <div className="space-y-6">
          <Card className="p-4 md:p-6">
            <h2 className="text-2xl font-black leading-tight">{t('myRequests')}</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {tabs.map((x) => {
                const active = tab === x.key;
                return (
                  <Link
                    key={x.key}
                    href={`/${params.locale}/mypage?tab=${x.key}`}
                    className={cn(
                      'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                      active ? 'border-border bg-bg/70' : 'border-border bg-bg/40 hover:bg-bg/60'
                    )}
                  >
                    <span className="whitespace-nowrap">{x.label}</span>
                    <span
                      className={cn(
                        'inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold',
                        active ? 'bg-accent text-black' : 'bg-card/70 text-muted border border-border'
                      )}
                    >
                      {x.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <RequestList locale={params.locale} items={items as any} />
        </div>
      </div>
    </div>
  );
}
