'use client';

import { Globe, Languages, Settings, Target, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Profile } from '@/lib/supabase/types';
import { getTranslatedLanguageName } from '@/lib/translated-language';
import type { ReactNode } from 'react';

type SettingsProfile = Pick<
  Profile,
  'id' | 'email' | 'nickname' | 'native_language' | 'target_language' | 'current_level' | 'learning_purpose'
>;

interface SettingsContentProps {
  profile: SettingsProfile | null;
}

export default function SettingsContent({ profile }: SettingsContentProps) {
  const { t } = useTranslation();
  const getLevelName = (level: string | null) => (
    level ? t(`onboarding.step3.levels.${level}`, { defaultValue: level }) : '-'
  );
  const getPurposeName = (purpose: string | null) => (
    purpose ? t(`onboarding.step2.goals.${purpose}`, { defaultValue: purpose }) : '-'
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white sm:text-3xl">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          {t('settings.manage_desc', 'Manage your preferences and profile settings')}
        </p>
      </div>

      <Card className="border-black/10 bg-white dark:border-white/10 dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <Languages className="h-5 w-5" />
            {t('settings.language_preferences', 'Language Preferences')}
          </CardTitle>
          <CardDescription className="text-black/60 dark:text-white/60">
            {t('settings.language_desc', 'Choose your preferred language for the application interface')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-black/70 dark:text-white/70">
              {t('settings.application_language', 'Application Language')}
            </label>
            <div className="max-w-xs">
              <LanguageSelector />
            </div>
            <p className="text-xs text-black/50 dark:text-white/50">
              {t('settings.application_language_hint', 'This changes the language of menus, buttons, and interface text. Your learning content language is set separately in your profile.')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-black/10 bg-white dark:border-white/10 dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <User className="h-5 w-5" />
            {t('settings.your_profile')}
          </CardTitle>
          <CardDescription className="text-black/60 dark:text-white/60">
            {t('settings.profile_desc', 'Your learning profile and preferences')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileItem
                icon={<Globe className="h-4 w-4" />}
                label={t('settings.native_language')}
                value={getTranslatedLanguageName(t, profile.native_language)}
              />
              <ProfileItem
                icon={<Target className="h-4 w-4" />}
                label={t('settings.target_language')}
                value={getTranslatedLanguageName(t, profile.target_language)}
              />
              <ProfileItem
                icon={<Settings className="h-4 w-4" />}
                label={t('settings.level')}
                value={getLevelName(profile.current_level)}
              />
              <ProfileItem
                icon={<User className="h-4 w-4" />}
                label={t('settings.goals')}
                value={getPurposeName(profile.learning_purpose)}
              />
            </div>
          ) : (
            <p className="text-sm text-black/50 dark:text-white/50">{t('common.loading')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="text-black/40 dark:text-white/40">{icon}</div>
      <div>
        <p className="text-xs font-medium text-black/50 dark:text-white/50">{label}</p>
        <p className="text-sm font-semibold text-black dark:text-white">{value}</p>
      </div>
    </div>
  );
}
