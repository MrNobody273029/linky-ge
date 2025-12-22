import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/components/AuthForms';

export default async function RegisterPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'auth' });

  return (
    <div className="container py-16">
      <RegisterForm
        locale={params.locale}
        title={t('registerTitle')}
        labels={{
          username: t('username'),
          email: t('email'),
          password: t('password'),
          confirmPassword: t('confirmPassword'),
          address: t('address'),
          phone: t('phone')
        }}
        submitLabel={t('submitRegister')}
        toLogin={t('toLogin')}
      />
    </div>
  );
}
