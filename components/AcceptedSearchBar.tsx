'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui';

export function AcceptedSearchBar({
  q,
  placeholder,
  clearLabel
}: {
  q: string;
  placeholder: string;
  clearLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [value, setValue] = useState(q);
  const [isPending, startTransition] = useTransition();

  // sync input if user navigates back/forward
  useEffect(() => setValue(q), [q]);

  // debounce url updates
  useEffect(() => {
    const t = setTimeout(() => {
      const next = value.trim();

      const params = new URLSearchParams(sp.toString());
      if (next) params.set('q', next);
      else params.delete('q');

      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pathname]);

  const showClear = value.trim().length > 0;

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="sm:w-[360px]"
          disabled={isPending}
        />

        {showClear ? (
          <button
            type="button"
            onClick={() => setValue('')}
            className="text-sm font-semibold text-muted hover:text-fg"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
