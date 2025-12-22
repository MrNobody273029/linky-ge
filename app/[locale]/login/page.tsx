export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/AuthForms';

export default async function LoginPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'auth' });

  return (
    <div className="container py-16">
      <LoginForm
        locale={params.locale}
        title={t('loginTitle')}
        labels={{ email: t('email'), password: t('password') }}
        submitLabel={t('submitLogin')}
        toRegister={t('toRegister')}
      />
      <p className="mx-auto mt-4 max-w-md text-xs text-muted">
        Demo user: demo@linky.ge / UserDemo123! &nbsp;•&nbsp; Admin: admin@linky.ge / LinkyAdmin123!
      </p>
    </div>
  );
}
