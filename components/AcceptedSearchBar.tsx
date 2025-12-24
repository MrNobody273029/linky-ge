'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
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

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(q);
  const [isPending, startTransition] = useTransition();

  // ✅ Sync from URL ONLY when user is not focused in the input (back/forward navigation etc.)
  useEffect(() => {
    const el = inputRef.current;
    const isFocused = !!el && document.activeElement === el;
    if (!isFocused) setValue(q);
  }, [q]);

  // ✅ Debounced live filtering (updates URL)
  useEffect(() => {
    const t = setTimeout(() => {
      const next = value.trim();
      const currentQ = (sp.get('q') ?? '').trim();

      if (next === currentQ) return;

      const params = new URLSearchParams(sp.toString());

      // ✅ reset page when searching
      params.delete('page');

      if (next) params.set('q', next);
      else params.delete('q');

      const qs = params.toString();

      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });

      // ✅ keep focus (IMPORTANT: input MUST NOT be disabled)
      requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true });
      });
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pathname]);

  const showClear = value.trim().length > 0;

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-[360px]">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className={isPending ? 'opacity-80' : ''}
            // ❌ არ ვადიზებლებთ! disabled={isPending} ამის გამო გიგდებდა კურსორს
            aria-busy={isPending}
          />
        </div>

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
