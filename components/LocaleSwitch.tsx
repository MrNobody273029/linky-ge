'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui';
import { locales } from '@/locales';

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const nextLocale = locale === 'ka' ? 'en' : 'ka';

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => {
        // keep query + hash
        const query = searchParams.toString();
        const hash = typeof window !== 'undefined' ? window.location.hash : '';

        const parts = pathname.split('/');
        let nextPath = '';

        // pathname already includes locale as first segment
        if (locales.includes(parts[1] as any)) {
          parts[1] = nextLocale;
          nextPath = parts.join('/') || '/';
        } else {
          nextPath = '/' + nextLocale + pathname;
        }

        const full = `${nextPath}${query ? `?${query}` : ''}${hash}`;
        router.replace(full);
      }}
      aria-label="Switch language"
    >
      <Globe size={18} />
      <span className="hidden sm:inline">{nextLocale.toUpperCase()}</span>
    </Button>
  );
}
