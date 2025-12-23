'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card } from '@/components/ui';
import { AppLoader } from '@/components/AppLoader';

export function HeroForm({
  locale,
  isAuthed,
  ctaAuthed,
  ctaGuest
}: {
  locale: string;
  isAuthed: boolean;
  ctaAuthed: string;
  ctaGuest: string;
}) {
  const [url, setUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // ✅ NEW: auth popup
  const [showAuthModal, setShowAuthModal] = useState(false);

  function goAuth(trimmed: string) {
    router.push(
      `/${locale}/login?next=/${locale}/mypage&prefill=${encodeURIComponent(trimmed)}`
    );
  }

  function submit() {
    const trimmed = url.trim();
    if (!trimmed) return;

    // ✅ CHANGE: instead of redirect immediately, show modal
    if (!isAuthed) {
      setShowAuthModal(true);
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/requests`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productUrl: trimmed })
      });

      if (res.ok) {
        router.push(`/${locale}/mypage`);
        return;
      }

      const j = await res.json().catch(() => ({}));
      alert(j?.error ?? 'Error creating request');
    });
  }

  const trimmedNow = url.trim();

  return (
    <>
      {isPending ? <AppLoader /> : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isPending) return;
          submit();
        }}
        className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-soft"
      >
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-card/50 px-3">
          <span className="text-muted">🔗</span>

          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="border-0 bg-transparent px-0 py-3 focus:ring-0"
            disabled={isPending}
            inputMode="url"
            autoComplete="url"
          />
        </div>

        <Button type="submit" disabled={isPending || !trimmedNow} className="h-12 px-6">
          {isAuthed ? ctaAuthed : ctaGuest} <span aria-hidden>→</span>
        </Button>
      </form>

      {/* ✅ NEW: Auth required modal (only when guest tries to submit) */}
      {showAuthModal ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-3"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="relative overflow-hidden p-5">
              {/* X */}
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/50 text-muted hover:bg-card"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="text-lg font-black">
                {locale === 'ka' ? 'ავტორიზაცია საჭიროა' : 'Authorization required'}
              </div>

              <div className="mt-2 text-sm text-muted">
                {locale === 'ka'
                  ? 'შეთავაზების მისაღებად გაიარეთ ავტორიზაცია.'
                  : 'To receive an offer, please sign in.'}
              </div>

              {/* show the link user tried to send (nice touch) */}
              {trimmedNow ? (
                <div className="mt-4 rounded-2xl border border-border bg-card/40 p-3">
                  <div className="text-xs font-semibold text-muted">
                    {locale === 'ka' ? 'ბმული' : 'Link'}
                  </div>
                  <div className="mt-1 break-all text-sm font-semibold">{trimmedNow}</div>
                </div>
              ) : null}

              <div className="mt-5 flex gap-3">
                <Button
                  className="w-full"
                  onClick={() => goAuth(trimmedNow)}
                >
                  {locale === 'ka' ? 'ავტორიზაცია' : 'Sign in'} <span aria-hidden>→</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowAuthModal(false)}
                >
                  {locale === 'ka' ? 'დახურვა' : 'Close'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
