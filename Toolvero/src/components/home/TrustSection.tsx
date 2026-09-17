import React from 'react';
import { Zap, Feather, ShieldCheck, Gift, Smartphone } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const values = [
    {
      icon: Zap,
      title: 'Fast',
      description: 'Process files quickly with instant client-side execution.',
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
    },
    {
      icon: Feather,
      title: 'Simple',
      description: 'No complicated software installation or bloated setup.',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      icon: ShieldCheck,
      title: 'Privacy Focused',
      description: 'Process files securely right in your browser memory.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      icon: Gift,
      title: 'Free to Use',
      description: 'Core utility tools are available without subscriptions.',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
    },
    {
      icon: Smartphone,
      title: 'Works Everywhere',
      description: 'Desktop, tablet, and mobile friendly responsive UX.',
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
    },
  ];

  return (
    <section className="py-16 md:py-24" aria-labelledby="why-toolvero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 id="why-toolvero-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Why Toolvero?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Engineered from the ground up for privacy, speed, and clean modern convenience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {values.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-surface-cardDark shadow-subtle hover:shadow-card transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${val.bg} ${val.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  {val.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
