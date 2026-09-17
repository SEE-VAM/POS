import React from 'react';
import { Search, Sparkles, ShieldCheck, Zap, Lock } from 'lucide-react';

interface HeroProps {
  onSearchClick: () => void;
  onExploreTools: () => void;
  onPopularTools: () => void;
  onQuickQuery: (q: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSearchClick,
  onExploreTools,
  onPopularTools,
  onQuickQuery,
}) => {
  const exampleSearches = [
    'Compress image',
    'Convert PDF',
    'Resize image',
    'Convert MP4 to MP3',
  ];

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800 text-xs font-medium text-brand-700 dark:text-brand-300 mb-6 shadow-xs animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>New: Instant Client-Side Image &amp; PDF Engines</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Powerful Online Tools.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Simple &amp; Fast.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-5 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Compress, convert, resize and optimize your files directly in your browser. No registration, no watermarks, and zero file storage.
        </p>

        {/* Search Bar Input Container */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div
            onClick={onSearchClick}
            className="group cursor-pointer flex items-center w-full p-2.5 sm:p-3 bg-white dark:bg-surface-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card hover:border-brand-500/60 dark:hover:border-brand-500/60 transition-all duration-200"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSearchClick()}
            aria-label="Open search dialog"
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mr-3">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-sm sm:text-base text-slate-400 dark:text-slate-500 flex-1 text-left">
              Search for a tool (e.g. compress, convert, pdf)...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              Ctrl K
            </kbd>
          </div>

          {/* Quick Example Searches */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium mr-1">Popular searches:</span>
            {exampleSearches.map((example) => (
              <button
                key={example}
                onClick={() => onQuickQuery(example)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onExploreTools}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Explore All Tools
          </button>
          <button
            onClick={onPopularTools}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all duration-150 focus:outline-none"
          >
            Popular Tools
          </button>
        </div>

        {/* Micro Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% In-Browser Privacy</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Instant Client-Side Speed</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-blue-500" />
            <span>No File Storage or Tracking</span>
          </div>
        </div>
      </div>
    </section>
  );
};
