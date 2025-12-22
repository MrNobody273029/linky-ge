'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';
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

  function submit() {
    const trimmed = url.trim();
    if (!trimmed) return;

    if (!isAuthed) {
      router.push(`/${locale}/login?next=/${locale}/mypage&prefill=${encodeURIComponent(trimmed)}`);
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

        <Button type="submit" disabled={isPending || !url.trim()} className="h-12 px-6">
          {isAuthed ? ctaAuthed : ctaGuest} <span aria-hidden>→</span>
        </Button>
      </form>
    </>
  );
}
