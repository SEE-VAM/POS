import React from 'react';

interface AdBannerProps {
  format?: 'leaderboard' | 'rectangle' | 'responsive';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ format = 'responsive', className = '' }) => {
  return (
    <aside
      aria-label="Advertisement"
      className={`relative overflow-hidden rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 text-center ${className}`}
    >
      <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 mb-2">
        Advertisement
      </div>
      <div className="flex items-center justify-center min-h-[90px] text-xs text-slate-400 dark:text-slate-500">
        <span className="max-w-xs leading-normal">
          Reserved Sponsor Placement &bull; Clean &amp; Non-Intrusive Integration Space
        </span>
      </div>
    </aside>
  );
};
