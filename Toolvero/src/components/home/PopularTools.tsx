import React from 'react';
import { POPULAR_TOOLS } from '../../data/tools';
import { ToolDefinition } from '../../types/tool';
import { ToolCard } from '../common/ToolCard';

interface PopularToolsProps {
  onSelectTool: (tool: ToolDefinition) => void;
  favorites: string[];
  onToggleFavorite: (toolId: string) => void;
}

export const PopularTools: React.FC<PopularToolsProps> = ({
  onSelectTool,
  favorites,
  onToggleFavorite,
}) => {
  return (
    <section id="popular-tools" className="py-12 md:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Popular Tools
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            The most frequently used converters, optimizers, and compressors chosen by students, creators, and professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POPULAR_TOOLS.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onSelect={onSelectTool}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
