import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { TOOLS } from '../../data/tools';
import { CategoryDefinition } from '../../types/tool';
import { CategoryCard } from '../common/CategoryCard';

interface CategorySectionProps {
  onSelectCategory: (category: CategoryDefinition) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-12 md:py-16" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 id="categories-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Discover specialized utilities built for photos, videos, documents, audio, and web tasks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => {
            const count = TOOLS.filter((t) => t.category === category.id).length;
            return (
              <CategoryCard
                key={category.id}
                category={category}
                toolCount={count}
                onSelect={onSelectCategory}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
