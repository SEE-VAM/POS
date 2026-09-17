import React from 'react';
import { ArrowRight, Heart, Zap, Cloud } from 'lucide-react';
import { ToolDefinition } from '../../types/tool';
import { DynamicIcon } from './DynamicIcon';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (tool: ToolDefinition) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-surface-cardDark p-5 sm:p-6 shadow-subtle hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
      <div>
        {/* Header row: icon + badge + favorite */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <DynamicIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.engine === 'browser' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <Zap className="w-2.5 h-2.5" />
                In-Browser
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                <Cloud className="w-2.5 h-2.5" />
                Cloud API
              </span>
            )}

            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(tool.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Name & description */}
        <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight mb-1.5">
          {tool.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6">
          {tool.shortDescription}
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSelect(tool)}
        className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-100 hover:bg-brand-600 text-slate-800 hover:text-white dark:bg-slate-800 dark:hover:bg-brand-600 dark:text-slate-200 dark:hover:text-white transition-colors duration-150 group/btn"
      >
        <span>Use Tool</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
