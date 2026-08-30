'use client';

import { Suspense } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { login, loginWithGoogle, signup } from '@/app/login/actions';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const error = searchParams.get('error');
  const rawMessage = searchParams.get('message');
  const message =
    rawMessage === 'onboarding_complete' || rawMessage?.includes('Create an account to save')
      ? t('onboarding.create_account_to_save')
      : rawMessage;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">
          {t('auth.login_title')} - LingoCoon
        </h1>

        {error && <Alert className="border-red-200 bg-red-50 text-red-600">{error}</Alert>}
        {message && <Alert className="border-green-200 bg-green-50 text-green-600">{message}</Alert>}

        <form className="mb-6">
          <button
            formAction={loginWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-50"
          >
            <GoogleIcon />
            {t('common.continue_with_google')}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">{t('auth.or_sign_in_with_email')}</span>
          </div>
        </div>

        <form className="space-y-6">
          <CredentialField
            id="email"
            label={t('common.email')}
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
          />
          <CredentialField
            id="password"
            label={t('common.password')}
            type="password"
            autoComplete="current-password"
            placeholder={t('common.password')}
          />
          <div className="flex flex-col gap-3">
            <button
              formAction={login}
              className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
            >
              {t('auth.login_button')}
            </button>
            <button
              formAction={signup}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              {t('common.register')}
            </button>
          </div>
        </form>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </div>
    </div>
  );
}

function Alert({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div className={`mb-4 rounded-md border p-4 text-sm ${className}`}>
      {children}
    </div>
  );
}

function CredentialField({
  id,
  label,
  type,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  type: 'email' | 'password';
  autoComplete: string;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
