import React from 'react';
import { ShieldCheck, Zap, Cloud, Heart, ChevronRight } from 'lucide-react';
import { ToolDefinition } from '../../types/tool';
import { DynamicIcon } from '../common/DynamicIcon';

interface ToolHeaderProps {
  tool: ToolDefinition;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onNavigate: (path: string) => void;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  tool,
  isFavorite,
  onToggleFavorite,
  onNavigate,
}) => {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('/')} className="hover:text-brand-600 transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('/tools')} className="hover:text-brand-600 transition-colors">
          Tools
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate(`/${tool.category}-tools`)} className="capitalize hover:text-brand-600 transition-colors">
          {tool.category} Tools
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
          {tool.name}
        </span>
      </nav>

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 shadow-xs">
            <DynamicIcon name={tool.icon} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {tool.name}
              </h1>
              {tool.engine === 'browser' ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Zap className="w-3 h-3" />
                  In-Browser Engine
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Cloud className="w-3 h-3" />
                  Cloud API Ready
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Favorite toggle */}
        <div className="flex sm:flex-col items-center justify-end shrink-0">
          <button
            onClick={() => onToggleFavorite(tool.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              isFavorite
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>
        </div>
      </div>

      {/* Trust & Privacy Notice */}
      <div className="mt-5 flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          {tool.engine === 'browser'
            ? 'Processing happens directly in your browser. Your files never leave your device.'
            : 'Your files are processed securely and are not stored permanently. Cloud API engine ready.'}
        </span>
      </div>
    </div>
  );
};
