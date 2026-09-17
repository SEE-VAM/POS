import React, { useEffect } from 'react';
import { Home, Search } from 'lucide-react';
import { updatePageMeta } from '../utils/seoHelpers';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate, onOpenSearch }) => {
  useEffect(() => {
    updatePageMeta({
      title: '404 - Page Not Found | Toolvero',
      description: 'The requested utility or page could not be located on Toolvero.',
    });
  }, []);

  return (
    <div className="py-20 md:py-32 text-center px-4">
      <div className="max-w-md mx-auto space-y-6">
        <span className="text-6xl sm:text-7xl font-extrabold text-brand-600 dark:text-brand-400 font-mono">
          404
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The page or online utility you are looking for might have moved, or the URL may be mistyped.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </button>
          <button
            onClick={onOpenSearch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Tools (Ctrl+K)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
