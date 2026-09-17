import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { CATEGORIES } from '../data/categories';
import { ToolCard } from '../components/common/ToolCard';
import { ToolCategory, ToolDefinition } from '../types/tool';
import { updatePageMeta } from '../utils/seoHelpers';
import { analytics } from '../services/analytics';
import { AdBanner } from '../components/common/AdBanner';

interface ToolsCatalogPageProps {
  onNavigate: (path: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const ToolsCatalogPage: React.FC<ToolsCatalogPageProps> = ({
  onNavigate,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Check initial search query from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      setSearchQuery(q);
    }

    updatePageMeta({
      title: 'All Online Tools Catalog — Free File Utilities | Toolvero',
      description: 'Explore the full directory of online tools at Toolvero. Compress images, convert audio/video, edit PDFs, and generate checksums directly in your browser.',
      canonicalUrl: 'https://toolvero.com/tools',
      keywords: ['all tools', 'online utilities', 'image tools', 'pdf tools', 'video converters'],
    });

    analytics.trackPageView('/tools', 'Toolvero - All Tools Catalog');
  }, []);

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const terms = searchQuery.toLowerCase().trim().split(/\s+/);
      const corpus = [
        tool.name,
        tool.category,
        tool.shortDescription,
        tool.description,
        ...(tool.keywords || []),
      ]
        .join(' ')
        .toLowerCase();

      return terms.every((t) => corpus.includes(t));
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-xs font-semibold text-brand-600 dark:text-brand-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>26+ Production Utilities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Online Utilities Catalog
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Browse our complete collection of fast, private tools for graphics, multimedia, documents, and developer workflows.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Tools ({TOOLS.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = TOOLS.filter((t) => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name or keyword..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No tools match your filter criteria.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try clearing your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={(t) => onNavigate(t.route)}
                isFavorite={favorites.includes(tool.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-12">
          <AdBanner format="leaderboard" />
        </div>
      </div>
    </div>
  );
};
