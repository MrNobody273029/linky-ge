export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  Clipboard,
  Search,
  ThumbsUp,
  Shield,
  CreditCard,
  Truck,
  BadgeCheck
} from 'lucide-react';

import { Pill, Card, Button } from '@/components/ui';
import { HeroForm } from '@/components/HeroForm';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ProductShowcaseCard } from '@/components/ProductShowcaseCard';

export default async function Page({
  params
}: {
  params: { locale: string };
}) {
  const locale = params.locale;

  const tHero = await getTranslations({ locale, namespace: 'hero' });
  const tHow = await getTranslations({ locale, namespace: 'how' });
  const tBen = await getTranslations({ locale, namespace: 'benefits' });
  const tCta = await getTranslations({ locale, namespace: 'cta' });
  const tAcc = await getTranslations({ locale, namespace: 'accepted' });

  const user = await getCurrentUser();

  // ✅ last 4 accepted (50%) orders
  const accepted = await prisma.request.findMany({
    where: {
      status: 'PAID_PARTIALLY',
      paymentStatus: 'PARTIAL',
      offer: { isNot: null },
      isRepeat: false // ✅ IMPORTANT
    },
    orderBy: { updatedAt: 'desc' },
    take: 4,
    include: { offer: true }
  });

  const saveNowHref = user ? `/${locale}/accepted` : `/${locale}/register`;

  return (
    <div>
      {/* ================= HERO ================= */}
      <section id="send" className="relative overflow-hidden">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
              {tHero('title1')}
              <span className="block text-muted">{tHero('title2')}</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted md:text-base">
              {tHero('subtitle')}
            </p>

            <HeroForm
              locale={locale}
              isAuthed={!!user}
              ctaAuthed={tHero('cta')}
              ctaGuest={tHero('cta')}
            />

            <p className="mt-3 text-xs text-muted">{tHero('note')}</p>
          </div>
        </div>
      </section>

      {/* ================= ACCEPTED SHOWCASE ================= */}
      <section id="deals" className="border-t border-border bg-bg/40">
        <div className="container py-12">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">{tAcc('title')}</h2>
            </div>

            <Link href={`/${locale}/accepted`}>
              <Button className="bg-accent text-black hover:bg-accent/90">
                {tAcc('viewAll')}
              </Button>
            </Link>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {accepted.map((r) => (
                  <ProductShowcaseCard
                    key={r.id}
                    locale={locale}
                    title={r.offer!.productTitle}
                    imageUrl={r.offer!.imageUrl}
                    originalPrice={r.originalPrice ? Number(r.originalPrice) : null}
                    linkyPrice={Number(r.offer!.linkyPrice)}
                    currency={r.currency}
                    etaDays={r.offer!.etaDays}
                    sourceRequestId={r.id}
                    isAuthed={!!user}
                  />

            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="container py-16">
        <h2 className="text-center text-3xl font-black">
          {tHow('title')}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted">
          {tHow('subtitle')}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-soft">
              <Clipboard />
            </div>
            <h3 className="font-bold">{tHow('step1t')}</h3>
            <p className="mt-2 text-sm text-muted">
              {tHow('step1d')}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-soft">
              <Search />
            </div>
            <h3 className="font-bold">{tHow('step2t')}</h3>
            <p className="mt-2 text-sm text-muted">
              {tHow('step2d')}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-soft">
              <ThumbsUp />
            </div>
            <h3 className="font-bold">{tHow('step3t')}</h3>
            <p className="mt-2 text-sm text-muted">
              {tHow('step3d')}
            </p>
          </Card>
        </div>
      </section>

      {/* ================= BENEFITS ================= */}
      <section id="benefits" className="border-t border-border bg-bg/40">
        <div className="container py-16">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="p-6">
                <Shield />
                <div className="mt-4 font-bold">{tBen('card1t')}</div>
                <div className="mt-2 text-sm text-muted">{tBen('card1d')}</div>
              </Card>

              <Card className="p-6">
                <CreditCard />
                <div className="mt-4 font-bold">{tBen('card2t')}</div>
                <div className="mt-2 text-sm text-muted">{tBen('card2d')}</div>
              </Card>

              <Card className="p-6">
                <Truck />
                <div className="mt-4 font-bold">{tBen('card3t')}</div>
                <div className="mt-2 text-sm text-muted">{tBen('card3d')}</div>
              </Card>

              <Card className="p-6">
                <BadgeCheck />
                <div className="mt-4 font-bold">{tBen('card4t')}</div>
                <div className="mt-2 text-sm text-muted">{tBen('card4d')}</div>
              </Card>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-black">{tBen('title')}</h2>
              <p className="mt-4 text-sm text-muted">{tBen('body1')}</p>
              <p className="mt-3 text-sm text-muted">{tBen('body2')}</p>

              {/* ✅ აქ “დემო” ამოვშალეთ. “დაზოგე ახლა” გადადის accepted თუ ავტორიზებულია */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={saveNowHref}>
                  <Button>{tBen('cta1')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="container py-20">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/20 p-8 text-center">
            <h2 className="text-3xl font-black md:text-4xl">
              {tCta('title')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
              {tCta('subtitle')}
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <HeroForm
                locale={locale}
                isAuthed={!!user}
                ctaAuthed={tCta('button')}
                ctaGuest={tCta('button')}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
