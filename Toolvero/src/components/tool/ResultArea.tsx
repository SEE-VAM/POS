import React, { useEffect } from 'react';
import { Download, RefreshCw, CheckCircle2, ArrowDown, FileCheck, Share2 } from 'lucide-react';
import { ProcessResult } from '../../types/tool';
import { formatBytes } from '../../utils/fileHelpers';
import confetti from 'canvas-confetti';

interface ResultAreaProps {
  result: ProcessResult;
  onReset: () => void;
}

export const ResultArea: React.FC<ResultAreaProps> = ({ result, onReset }) => {
  useEffect(() => {
    // Polish: Fire confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#10b981', '#6366f1'],
      });
    } catch {
      // Graceful fallback if canvas confetti fails
    }
  }, []);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-card text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Your file is ready!
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Successfully processed and rendered in your browser.
        </p>
      </div>

      {/* Comparison stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] uppercase font-semibold text-slate-400">Original Size</div>
          <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {formatBytes(result.originalSize)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] uppercase font-semibold text-slate-400">Processed Size</div>
          <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatBytes(result.processedSize)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] uppercase font-semibold text-slate-400">Total Savings</div>
          <div className="text-sm sm:text-base font-bold text-brand-600 dark:text-brand-400 mt-0.5">
            {result.savingsPercentage > 0 ? `-${result.savingsPercentage}%` : 'Optimized'}
          </div>
        </div>
      </div>

      {/* Primary and secondary download controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download {result.filename}</span>
        </button>

        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Process Another File</span>
        </button>
      </div>
    </div>
  );
};
