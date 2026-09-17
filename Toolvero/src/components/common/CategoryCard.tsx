import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CategoryDefinition } from '../../types/tool';
import { DynamicIcon } from './DynamicIcon';

interface CategoryCardProps {
  category: CategoryDefinition;
  toolCount: number;
  onSelect: (category: CategoryDefinition) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  toolCount,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(category)}
      className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-surface-cardDark p-6 shadow-subtle hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <div className={category.color}>
              <DynamicIcon name={category.icon} className="w-6 h-6" />
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {toolCount} Tools
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {category.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:underline">
        <span>View all {category.name}</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
