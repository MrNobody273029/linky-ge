'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Key = 'terms' | 'privacy' | 'support' | 'about';

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer');
  const [open, setOpen] = useState<Key | null>(null);

  const items = useMemo(
    () =>
      [
        { key: 'terms' as const, label: t('links.terms') },
        { key: 'privacy' as const, label: t('links.privacy') },
        { key: 'support' as const, label: t('links.support') },
        { key: 'about' as const, label: t('links.about') }
      ] as const,
    [t]
  );

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null);
    }
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const modalTitle = open ? t(`modals.${open}.title`) : '';
  const modalBody = open ? (t.raw(`modals.${open}.body`) as string[]) : [];

  return (
    <footer className="border-t border-border bg-bg">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-center">
          {/* Brand */}
<div className="flex items-center gap-3">
  <Image
    src="/logo.png"
    alt="Linky.ge"
    width={64}
    height={64}
    className="rounded-full"
    priority
  />

  <div className="leading-tight">
    <div className="text-base font-extrabold">Linky.ge</div>
    <div className="text-sm text-muted">
      გამოგვიგზავნე ლინკი — ჩვენ ჩამოგიტანთ იაფად და გამჭვირვალედ
    </div>
  </div>
</div>


          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted md:justify-center">
            {items.map((it) => (
              <button
                key={it.key}
                type="button"
                onClick={() => setOpen(it.key)}
                className="rounded-md outline-none transition hover:text-fg focus-visible:ring-2 focus-visible:ring-accent"
              >
                {it.label}
              </button>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted md:text-right">
            © {new Date().getFullYear()} Linky.ge. {t('rights')}
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          onMouseDown={() => setOpen(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-glow"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <h3 className="text-base font-bold">{modalTitle}</h3>
                <p className="mt-1 text-xs text-muted">{t('modalHint')}</p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg/60 text-muted transition hover:text-fg focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-5">
              <div className="space-y-3 text-sm text-muted">
                {modalBody.map((p, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="rounded-xl border border-border bg-bg/60 px-4 py-2 text-sm font-semibold text-fg transition hover:bg-bg focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {t('close')}
                </button>

                <Link
                  href={`/${locale}#send`}
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={() => setOpen(null)}
                >
                  {t('cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
