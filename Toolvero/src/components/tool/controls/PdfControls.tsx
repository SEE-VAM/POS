import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface PdfControlsProps {
  onConvert: (options: { orientation: 'auto' | 'p' | 'l' }) => void;
  isProcessing: boolean;
}

export const PdfControls: React.FC<PdfControlsProps> = ({ onConvert, isProcessing }) => {
  const [orientation, setOrientation] = useState<'auto' | 'p' | 'l'>('auto');

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white">
        <FileText className="w-4 h-4 text-rose-500" />
        <span>PDF Packaging Settings</span>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Page Orientation
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'auto', label: 'Auto (Match Photo)' },
            { id: 'p', label: 'Portrait' },
            { id: 'l', label: 'Landscape' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOrientation(item.id as any)}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                orientation === item.id
                  ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onConvert({ orientation })}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>Generate PDF Document</span>
      </button>
    </div>
  );
};
