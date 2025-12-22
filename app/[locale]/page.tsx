export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import { Pill, Card, Button } from '@/components/ui';
import { HeroForm } from '@/components/HeroForm';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { Clipboard, Search, ThumbsUp, Shield, CreditCard, Truck, BadgeCheck } from 'lucide-react';

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const tHero = await getTranslations({ locale, namespace: 'hero' });
  const tHow = await getTranslations({ locale, namespace: 'how' });
  const tBen = await getTranslations({ locale, namespace: 'benefits' });
  const tCta = await getTranslations({ locale, namespace: 'cta' });

  const user = await getCurrentUser();

  const deals = await prisma.offer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: { request: true }
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Pill className="mx-auto w-fit">
              <span className="inline-flex h-2 w-2 rounded-full bg-success" />
              {tHero('badge')}
            </Pill>

            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
              {tHero('title1')} <span className="text-muted">{tHero('title2')}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted md:text-base">{tHero('subtitle')}</p>

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

      {/* Live Deals */}
      <section id="deals" className="border-t border-border bg-bg/40">
        <div className="container py-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">🔥 Live Deals happening right now</h2>
            <a href={`/${locale}/mypage`} className="text-sm font-semibold text-muted hover:text-fg">
              View all
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((d) => {
             const original = d.request.originalPrice
              ? Number(d.request.originalPrice)
              : null;

            const linky = Number(d.linkyPrice);

            const saved = original ? Math.max(0, original - linky) : 0;
                  return (
                <Card key={d.id} className="p-4">
                  <div className="relative h-40 w-full overflow-hidden rounded-xl bg-border">
                    <Image src={d.imageUrl} alt={d.request.titleHint ?? 'Deal'} fill className="object-cover" />
                    <div className="absolute right-3 top-3 rounded-full bg-card/80 px-2 py-1 text-xs font-semibold text-muted">
                      🌍
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="line-clamp-2 text-sm font-bold">{d.request.titleHint ?? 'Product'}</div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                      {d.request.originalPrice ? (
                  <span className="line-through">
                    {Number(d.request.originalPrice).toFixed(2)} ₾
                  </span>
                                        ) : (
                        <span>—</span>
                      )}
                     <span className="rounded-full bg-success/20 px-2 py-1 font-semibold text-success">
                        {linky.toFixed(2)} ₾
                      </span>

                    </div>
                  <div className="mt-2 text-xs text-muted">
                    Saved {saved.toFixed(2)} GEL
                  </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-16">
        <h2 className="text-center text-3xl font-black">{tHow('title')}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted">{tHow('subtitle')}</p>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-soft">
              <Clipboard />
            </div>
            <h3 className="font-bold">{tHow('step1t')}</h3>
            <p className="mt-2 text-sm text-muted">{tHow('step1d')}</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-soft">
              <Search />
            </div>
            <h3 className="font-bold">{tHow('step2t')}</h3>
            <p className="mt-2 text-sm text-muted">{tHow('step2d')}</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-soft">
              <ThumbsUp />
            </div>
            <h3 className="font-bold">{tHow('step3t')}</h3>
            <p className="mt-2 text-sm text-muted">{tHow('step3d')}</p>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-t border-border bg-bg/40">
        <div className="container py-16">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-soft">
                  <Shield />
                </div>
                <div className="mt-4 font-bold">{tBen('card1t')}</div>
                <div className="mt-2 text-sm text-muted">{tBen('card1d')}</div>
              </Card>

              <Card className="p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-soft">
                  <CreditCard />
                </div>
                <div className="mt-4 font-bold">{tBen('card2t')}</div>
                <div className="mt-2 text-sm text-muted">{tBen('card2d')}</div>
              </Card>

              <Card className="p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-soft">
                  <Truck />
                </div>
                <div className="mt-4 font-bold">{tBen('card3t')}</div>
                <div className="mt-2 text-sm text-muted">{tBen('card3d')}</div>
              </Card>

              <Card className="p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-soft">
                  <BadgeCheck />
                </div>
                <div className="mt-4 font-bold">{tBen('card4t')}</div>
                <div className="mt-2 text-sm text-muted">{tBen('card4d')}</div>
              </Card>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-black">{tBen('title')}</h2>
              <p className="mt-4 text-sm text-muted">{tBen('body1')}</p>
              <p className="mt-3 text-sm text-muted">{tBen('body2')}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`/${locale}/register`}>
                  <Button>{tBen('cta1')}</Button>
                </a>
                <a href={`/${locale}/login?next=/${locale}/mypage`}>
                  <Button variant="secondary">{tBen('cta2')}</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="bg-gradient-to-b from-bg to-black/10 dark:to-black/60">
          <div className="container py-20">
            <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/20 p-8 text-center shadow-glow backdrop-blur">
              <h2 className="text-3xl font-black md:text-4xl">{tCta('title')}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">{tCta('subtitle')}</p>

              <div className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-card/30 p-2">
                <input
                  className="w-full bg-transparent px-4 py-3 text-sm outline-none"
                  placeholder={tHero('placeholder')}
                  readOnly
                />
                <a href={`/${locale}/login?next=/${locale}/mypage`}>
                  <Button className="h-12 px-6">{tCta('button')}</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
