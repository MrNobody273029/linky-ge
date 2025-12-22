// app/[locale]/admin/page.tsx
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminPanel } from '@/components/AdminPanel';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function expireOldOffers() {
  const cutoff = daysAgo(7);

  const expiredOffers = await prisma.offer.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { requestId: true, request: { select: { status: true } } }
  });

  const ids = expiredOffers
    .filter((o) => o.request.status === 'OFFERED')
    .map((o) => o.requestId);

  if (ids.length) {
    await prisma.request.updateMany({
      where: { id: { in: ids }, status: 'OFFERED' },
      data: { status: 'EXPIRED' }
    });
  }
}

export default async function AdminPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams?: { tab?: string };
}) {
  try {
    await requireAdmin();
  } catch {
    redirect(`/${params.locale}/login?next=/${params.locale}/admin`);
  }

  await expireOldOffers();

  const requests = await prisma.request.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, offer: true }
  });

  const shaped = requests.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    title: r.titleHint ?? 'Request',
    productUrl: r.productUrl,
    status: r.status,

    paymentStatus: r.paymentStatus, // ✅ აი ეს დაამატე

    originalPrice: r.originalPrice ? Number(r.originalPrice) : null,
    currency: r.currency,
    cancelReason: r.cancelReason ?? null,
    user: {
      username: r.user.username,
      email: r.user.email,
      phone: r.user.phone,
      fullAddress: r.user.fullAddress
    },
    offer: r.offer
      ? {
          imageUrl: r.offer.imageUrl,
          linkyPrice: Number(r.offer.linkyPrice),
          etaDays: r.offer.etaDays,
          note: r.offer.note ?? null,
          offeredAt: r.offer.createdAt.toISOString(),
          adminSourceUrl: r.offer.adminSourceUrl ?? null
        }
      : null
  }));

  const tab = searchParams?.tab ?? 'new';

  return (
    <div className="container py-6 md:py-8">
      <AdminPanel locale={params.locale} tab={tab} requests={shaped} />
    </div>
  );
}
