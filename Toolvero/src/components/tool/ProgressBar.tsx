import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label = 'Processing your file...',
}) => {
  const boundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full space-y-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle">
      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
          {label}
        </span>
        <span className="font-mono">{boundedProgress}%</span>
      </div>

      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${boundedProgress}%` }}
        />
      </div>
    </div>
  );
};
