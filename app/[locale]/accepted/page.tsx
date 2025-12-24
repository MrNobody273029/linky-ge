export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui';
import { ProductShowcaseCard } from '@/components/ProductShowcaseCard';
import { getCurrentUser } from '@/lib/auth';
import { AcceptedSearchBar } from '@/components/AcceptedSearchBar';

const PAGE_SIZE = 20;

export default async function AcceptedPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams?: { page?: string; q?: string };
}) {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: 'accepted' });
  const user = await getCurrentUser();

  const qRaw = (searchParams?.q ?? '').toString();
  const q = qRaw.trim().slice(0, 80);

  const pageRaw = searchParams?.page ?? '1';
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);

  const where: any = {
    status: 'PAID_PARTIALLY',
    paymentStatus: 'PARTIAL',
    isRepeat: false,
    offer: { is: {} }
  };

  if (q) {
    where.offer = {
      is: {
        ...(where.offer?.is ?? {}),
        productTitle: { contains: q, mode: 'insensitive' }
      }
    };
  }

  const total = await prisma.request.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const rows = await prisma.request.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
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

  function buildPages(current: number, max: number) {
    const pages: (number | '…')[] = [];
    const push = (v: number | '…') => pages.push(v);

    if (max <= 7) {
      for (let i = 1; i <= max; i++) push(i);
      return pages;
    }

    push(1);

    const left = Math.max(2, current - 1);
    const right = Math.min(max - 1, current + 1);

    if (left > 2) push('…');
    for (let i = left; i <= right; i++) push(i);
    if (right < max - 1) push('…');

    push(max);
    return pages;
  }

  const pages = buildPages(safePage, totalPages);

  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    sp.set('page', String(p));
    if (q) sp.set('q', q);
    return `/${locale}/accepted?${sp.toString()}`;
  };

  const searchPlaceholder = locale === 'ka' ? 'ძებნა პროდუქტზე…' : 'Search products…';
  const clearLabel = locale === 'ka' ? 'გასუფთავება' : 'Clear';

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">{t('allTitle')}</h1>
        </div>

        <Link href={`/${locale}`}>
          <Button variant="secondary">{t('back')}</Button>
        </Link>
      </div>

      <AcceptedSearchBar q={q} placeholder={searchPlaceholder} clearLabel={clearLabel} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            isAuthed={!!user}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Link
          href={pageHref(Math.max(1, safePage - 1))}
          aria-disabled={safePage === 1}
          className={safePage === 1 ? 'pointer-events-none opacity-50' : ''}
        >
          <Button variant="secondary">‹</Button>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {pages.map((p, idx) =>
            p === '…' ? (
              <span key={`dots-${idx}`} className="px-2 text-sm text-muted">
                …
              </span>
            ) : (
              <Link key={p} href={pageHref(p)}>
                <Button
                  variant={p === safePage ? 'primary' : 'secondary'}
                  className={p === safePage ? 'bg-accent text-black hover:bg-accent/90' : ''}
                >
                  {p}
                </Button>
              </Link>
            )
          )}
        </div>

        <Link
          href={pageHref(Math.min(totalPages, safePage + 1))}
          aria-disabled={safePage === totalPages}
          className={safePage === totalPages ? 'pointer-events-none opacity-50' : ''}
        >
          <Button variant="secondary">›</Button>
        </Link>
      </div>
    </div>
  );
}
