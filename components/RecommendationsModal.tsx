'use client';

import { Button, Card } from '@/components/ui';

export function RecommendationsModal({
  locale,
  productUrl,
  onClose
}: {
  locale: string;
  productUrl: string;
  onClose: () => void;
}) {
  const title = locale === 'ka' ? 'რეკომენდაციები' : 'Recommendations';
  const subtitle =
    locale === 'ka'
      ? 'აქ მალე გამოჩნდება რეკომენდირებული ძებნის ლინკები (Google site:...)'
      : 'Recommended search links will appear here soon (Google site:...).';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4 md:p-5">
            <div className="min-w-0">
              <div className="text-lg font-black">{title}</div>
              <div className="mt-1 text-sm text-muted">{subtitle}</div>
            </div>

            <Button variant="secondary" onClick={onClose}>
              {locale === 'ka' ? 'დახურვა' : 'Close'}
            </Button>
          </div>

          <div className="p-4 md:p-6">
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <div className="text-xs font-semibold text-muted">{locale === 'ka' ? 'მომხმარებლის ლინკი' : 'User link'}</div>
              <div className="mt-1 break-all text-sm font-semibold">{productUrl}</div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-card/30 p-4 text-sm text-muted">
              {locale === 'ka'
                ? 'შემდეგ ეტაპზე აქ ჩავსვამთ: ბრენდის ამოცნობას + რეკომენდირებული საიტების ძებნის ლინკებს.'
                : 'Next step: detect brand + show recommended site search links.'}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
