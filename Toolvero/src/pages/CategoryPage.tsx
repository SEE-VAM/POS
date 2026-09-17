import React, { useEffect } from 'react';
import { CATEGORIES } from '../data/categories';
import { TOOLS } from '../data/tools';
import { ToolCategory, ToolDefinition } from '../types/tool';
import { ToolCard } from '../components/common/ToolCard';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { updatePageMeta } from '../utils/seoHelpers';
import { analytics } from '../services/analytics';
import { AdBanner } from '../components/common/AdBanner';
import { ChevronRight } from 'lucide-react';

interface CategoryPageProps {
  categoryId: ToolCategory;
  onNavigate: (path: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryId,
  onNavigate,
  favorites,
  onToggleFavorite,
}) => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const categoryTools = TOOLS.filter((t) => t.category === categoryId);

  useEffect(() => {
    if (category) {
      updatePageMeta({
        title: `${category.name} Online — Free, Fast & Private | Toolvero`,
        description: `${category.description} Free online tools for students, creators, and professionals.`,
        canonicalUrl: `https://toolvero.com${category.route}`,
        keywords: [category.name.toLowerCase(), `${category.id} tools`, 'online utilities'],
      });

      analytics.trackPageView(category.route, `Toolvero - ${category.name}`);
    }
  }, [category]);

  if (!category) return null;

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
          <button onClick={() => onNavigate('/')} className="hover:text-brand-600 transition-colors">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => onNavigate('/tools')} className="hover:text-brand-600 transition-colors">
            Tools
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-slate-200 font-medium">
            {category.name}
          </span>
        </nav>

        {/* Category Header Hero */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card mb-10">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <div className={category.color}>
              <DynamicIcon name={category.icon} className="w-8 h-8" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {category.name}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {categoryTools.length} Tools
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {category.description}
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categoryTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onSelect={(t) => onNavigate(t.route)}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>

        {/* Ad Placement */}
        <div className="mt-12">
          <AdBanner format="leaderboard" />
        </div>
      </div>
    </div>
  );
};
