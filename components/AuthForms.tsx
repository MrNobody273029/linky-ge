// components/AuthForms.tsx
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input, Button, Card } from '@/components/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = z
  .object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    fullAddress: z.string().min(5),
    phone: z.string().min(7)
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export function LoginForm({
  locale,
  title,
  labels,
  submitLabel,
  toRegister
}: {
  locale: string;
  title: string;
  labels: { email: string; password: string };
  submitLabel: string;
  toRegister: string;
}) {
  const params = useSearchParams();
  const next = params.get('next') || `/${locale}/mypage`;

  const form = useForm<{ email: string; password: string }>({ defaultValues: { email: '', password: '' } });

  async function onSubmit(values: { email: string; password: string }) {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      if (issues.email?.[0]) form.setError('email', { message: issues.email[0] });
      if (issues.password?.[0]) form.setError('password', { message: issues.password[0] });
      return;
    }

    const res = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(parsed.data)
    });

    const j = await res.json().catch(() => ({}));

    if (res.ok) {
      // ✅ bug-proof: full navigation ensures cookie is definitely sent on next request
      const role = String(j?.role || '');
      const target = role === 'ADMIN' ? `/${locale}/admin` : next;
      window.location.assign(target);
      return;
    }

    form.setError('email', { message: j?.error ?? 'Login failed' });
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-black">{title}</h1>
      <form className="mt-6 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Input placeholder={labels.email} {...form.register('email')} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
        <div>
          <Input type="password" placeholder={labels.password} {...form.register('password')} />
          <FieldError message={form.formState.errors.password?.message} />
        </div>
        <Button className="w-full" type="submit">
          {submitLabel}
        </Button>
      </form>

      <div className="mt-4 text-sm text-muted">
        <Link className="font-semibold text-fg hover:underline" href={`/${locale}/register`}>
          {toRegister}
        </Link>
      </div>
    </Card>
  );
}

export function RegisterForm({
  locale,
  title,
  labels,
  submitLabel,
  toLogin
}: {
  locale: string;
  title: string;
  labels: { username: string; email: string; password: string; confirmPassword: string; address: string; phone: string };
  submitLabel: string;
  toLogin: string;
}) {
  const form = useForm<{
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullAddress: string;
    phone: string;
  }>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullAddress: '',
      phone: '+995'
    }
  });

  async function onSubmit(values: any) {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      for (const key of Object.keys(issues)) {
        const msg = (issues as any)[key]?.[0];
        if (msg) form.setError(key as any, { message: msg });
      }
      return;
    }

    const res = await fetch(`/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(parsed.data)
    });

    const j = await res.json().catch(() => ({}));

    if (res.ok) {
      // ✅ same reason: full navigation after cookie set
      window.location.assign(`/${locale}/mypage`);
      return;
    }

    form.setError('email', { message: j?.error ?? 'Registration failed' });
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-black">{title}</h1>
      <form className="mt-6 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Input placeholder={labels.username} {...form.register('username')} />
          <FieldError message={form.formState.errors.username?.message} />
        </div>
        <div>
          <Input placeholder={labels.email} {...form.register('email')} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
        <div>
          <Input type="password" placeholder={labels.password} {...form.register('password')} />
          <FieldError message={form.formState.errors.password?.message} />
        </div>
        <div>
          <Input type="password" placeholder={labels.confirmPassword} {...form.register('confirmPassword')} />
          <FieldError message={form.formState.errors.confirmPassword?.message} />
        </div>
        <div>
          <Input placeholder={labels.address} {...form.register('fullAddress')} />
          <FieldError message={form.formState.errors.fullAddress?.message} />
        </div>
        <div>
          <Input placeholder={labels.phone} {...form.register('phone')} />
          <FieldError message={form.formState.errors.phone?.message} />
        </div>

        <Button className="w-full" type="submit">
          {submitLabel}
        </Button>
      </form>

      <div className="mt-4 text-sm text-muted">
        <Link className="font-semibold text-fg hover:underline" href={`/${locale}/login`}>
          {toLogin}
        </Link>
      </div>
    </Card>
  );
}
