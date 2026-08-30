'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Brain,
      title: t('onboarding.welcome_benefits.smart_title'),
      description: t('onboarding.welcome_benefits.smart_desc'),
    },
    {
      icon: Sparkles,
      title: t('onboarding.welcome_benefits.tracking_title'),
      description: t('onboarding.welcome_benefits.tracking_desc'),
    },
    {
      icon: Zap,
      title: t('onboarding.welcome_benefits.faster_title'),
      description: t('onboarding.welcome_benefits.faster_desc'),
    },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-8 py-8">
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-black flex items-center justify-center">
          <span className="text-5xl font-bold text-white">L</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {t('onboarding.welcome_title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          {t('onboarding.welcome_subtitle')}
        </p>
      </div>
      <div className="grid gap-4 w-full max-w-md">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 text-left"
          >
            <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
              <benefit.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <Button
        size="lg"
        onClick={onNext}
        className="w-full max-w-md text-lg py-6"
      >
        {t('onboarding.get_started')}
      </Button>

      <p className="text-xs text-muted-foreground">
        {t('onboarding.setup_time')}
      </p>
    </div>
  );
}
