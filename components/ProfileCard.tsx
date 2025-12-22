// components/ProfileCard.tsx
'use client';

import { useMemo, useState, useTransition } from 'react';
import { Card, Button, Input, cn } from '@/components/ui';
import { AppLoader } from '@/components/AppLoader';

function daysLeftFrom(lastISO: string | null | undefined) {
  if (!lastISO) return 0;
  const last = new Date(lastISO).getTime();
  const COOLDOWN_MS = 10 * 24 * 60 * 60 * 1000;
  const leftMs = COOLDOWN_MS - (Date.now() - last);
  return Math.max(0, Math.ceil(leftMs / (24 * 60 * 60 * 1000)));
}

export function ProfileCard({
  locale,
  username,
  fullAddress,
  phone,
  addressUpdatedAt,
  phoneUpdatedAt,
  passwordUpdatedAt
}: {
  locale: string;
  username: string;
  fullAddress: string;
  phone: string;
  addressUpdatedAt: string | null;
  phoneUpdatedAt: string | null;
  passwordUpdatedAt: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // inputs (empty by default as you wanted)
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');

  const addressLeft = useMemo(() => daysLeftFrom(addressUpdatedAt), [addressUpdatedAt]);
  const phoneLeft = useMemo(() => daysLeftFrom(phoneUpdatedAt), [phoneUpdatedAt]);
  const passLeft = useMemo(() => daysLeftFrom(passwordUpdatedAt), [passwordUpdatedAt]);

  const t = (ka: string, en: string) => (locale === 'ka' ? ka : en);

  async function submit() {
    const body: any = {};

    if (newAddress.trim()) body.fullAddress = newAddress.trim();
    if (newPhone.trim()) body.phone = newPhone.trim();

    const wantsPassword = curPass.trim() || newPass.trim() || newPass2.trim();
    if (wantsPassword) {
      body.currentPassword = curPass;
      body.newPassword = newPass;
      body.confirmPassword = newPass2;
    }

    startTransition(async () => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await res.json().catch(() => ({}));

      if (res.ok) {
        window.location.reload();
      } else {
        alert(j?.error ? String(j.error) : 'Failed');
      }
    });
  }

  function resetAndClose() {
    setOpen(false);
    setNewAddress('');
    setNewPhone('');
    setCurPass('');
    setNewPass('');
    setNewPass2('');
  }

  return (
    <>
      {/* ✅ overlay loader while PATCH is pending */}
      {isPending ? <AppLoader /> : null}

      <Card className="h-fit p-4 md:p-6 relative">
        {/* edit icon */}
        <button
          onClick={() => setOpen(true)}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 hover:bg-card/80"
          aria-label="Edit profile"
          title={t('პროფილის რედაქტირება', 'Edit profile')}
        >
          {/* simple pencil */}
          <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-80" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-black font-black">
            {username.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate font-bold">{username}</div>
            <div className="text-xs text-muted">{t('როლი: მომხმარებელი', 'Role: User')}</div>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-xs text-muted">
          <div>
            {t('მისამართი', 'Address')}: <span className="text-fg">{fullAddress}</span>
          </div>
          <div>
            {t('ტელეფონი', 'Phone')}: <span className="text-fg">{phone}</span>
          </div>
        </div>
      </Card>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-2 md:items-center md:p-6"
          onClick={resetAndClose}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="overflow-hidden p-4 md:p-5">
              <div className="text-lg font-black">{t('პროფილის რედაქტირება', 'Edit profile')}</div>
              <div className="mt-1 text-sm text-muted">
                {t('ცარიელი ველი არ შეიცვლება.', 'Empty fields will not be changed.')}
              </div>

              {/* ADDRESS */}
              <div className="mt-5 rounded-2xl border border-border bg-card/30 p-4">
                <div className="text-xs font-semibold text-muted">{t('მისამართი', 'Address')}</div>
                <div className="mt-1 text-xs text-muted">
                  {t('ამჟამინდელი:', 'Current:')} <span className="text-fg">{fullAddress}</span>
                </div>

                {addressLeft > 0 ? (
                  <div className="mt-2 text-xs text-muted">
                    {t(`ქულდაუნი: დარჩა ${addressLeft} დღე`, `Cooldown: ${addressLeft} days left`)}
                  </div>
                ) : null}

                <div className="mt-3">
                  <Input
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder={t('ახალი მისამართი', 'New address')}
                    disabled={addressLeft > 0}
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className="mt-4 rounded-2xl border border-border bg-card/30 p-4">
                <div className="text-xs font-semibold text-muted">{t('ტელეფონი', 'Phone')}</div>
                <div className="mt-1 text-xs text-muted">
                  {t('ამჟამინდელი:', 'Current:')} <span className="text-fg">{phone}</span>
                </div>

                {phoneLeft > 0 ? (
                  <div className="mt-2 text-xs text-muted">
                    {t(`ქულდაუნი: დარჩა ${phoneLeft} დღე`, `Cooldown: ${phoneLeft} days left`)}
                  </div>
                ) : null}

                <div className="mt-3">
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder={t('ახალი ტელეფონი', 'New phone')}
                    disabled={phoneLeft > 0}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="mt-4 rounded-2xl border border-border bg-card/30 p-4">
                <div className="text-xs font-semibold text-muted">{t('პაროლის შეცვლა', 'Change password')}</div>

                {passLeft > 0 ? (
                  <div className="mt-2 text-xs text-muted">
                    {t(`ქულდაუნი: დარჩა ${passLeft} დღე`, `Cooldown: ${passLeft} days left`)}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-muted">
                    {t('თუ არ გინდა შეცვლა — დატოვე ცარიელი.', 'Leave empty if you do not want to change it.')}
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  <Input
                    type="password"
                    value={curPass}
                    onChange={(e) => setCurPass(e.target.value)}
                    placeholder={t('ამჟამინდელი პაროლი', 'Current password')}
                    disabled={passLeft > 0}
                  />
                  <Input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder={t('ახალი პაროლი', 'New password')}
                    disabled={passLeft > 0}
                  />
                  <Input
                    type="password"
                    value={newPass2}
                    onChange={(e) => setNewPass2(e.target.value)}
                    placeholder={t('გაიმეორე ახალი პაროლი', 'Repeat new password')}
                    disabled={passLeft > 0}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={resetAndClose} disabled={isPending}>
                  {t('დახურვა', 'Close')}
                </Button>
                <Button onClick={submit} disabled={isPending}>
                  {t('შეცვლა', 'Save changes')}
                </Button>
              </div>

              <div className="mt-3 text-xs text-muted">
                {t('შეცვლები დაუყოვნებლივ ჩაიწერება ბაზაში.', 'Changes will be saved to the database immediately.')}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
