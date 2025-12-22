// components/QuickRequestBar.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Input, Button, Card, cn } from '@/components/ui';

function isHttpUrl(u: string) {
  try {
    const x = new URL(u);
    return x.protocol === 'http:' || x.protocol === 'https:';
  } catch {
    return false;
  }
}

export function QuickRequestBar({
  locale,
  variant = 'card'
}: {
  locale: string;
  variant?: 'card' | 'inline';
}) {
  const t = useTranslations('dash');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit() {
    const v = url.trim();
    if (!isHttpUrl(v)) {
      setErr('Invalid link');
      return;
    }
    setErr(null);

    startTransition(async () => {
      const res = await fetch(`/api/requests`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productUrl: v })
      });

      if (res.ok) {
        setUrl('');
        window.location.reload();
        return;
      }

      const j = await res.json().catch(() => ({}));
      setErr(j?.error ?? 'Failed');
    });
  }

  const content = (
    <>
      <div className={cn('flex w-full flex-col gap-2 sm:flex-row', variant === 'inline' ? '' : 'mt-4')}>
        <Input
          className="flex-1"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button className="sm:w-[180px]" onClick={submit} disabled={isPending}>
          {t('findBetter')}
        </Button>
      </div>

      {err ? <div className="mt-2 text-xs text-red-500">{err}</div> : null}
    </>
  );

  // ✅ default old look
  if (variant === 'card') {
    return (
      <Card className="p-6">
        <div className="text-lg font-black">{t('findBetter')}</div>
        {content}
      </Card>
    );
  }

  // ✅ inline (no Card) for narrow header usage
  return <div>{content}</div>;
}
