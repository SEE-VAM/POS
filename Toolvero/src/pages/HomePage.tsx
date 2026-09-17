import React, { useEffect } from 'react';
import { Hero } from '../components/home/Hero';
import { CategorySection } from '../components/home/CategorySection';
import { PopularTools } from '../components/home/PopularTools';
import { TrustSection } from '../components/home/TrustSection';
import { AdBanner } from '../components/common/AdBanner';
import { CategoryDefinition, ToolDefinition } from '../types/tool';
import { updatePageMeta } from '../utils/seoHelpers';
import { analytics } from '../services/analytics';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenSearch,
  favorites,
  onToggleFavorite,
}) => {
  useEffect(() => {
    updatePageMeta({
      title: 'Toolvero — Powerful Online Tools. Simple & Fast.',
      description: 'Compress, convert, resize and optimize your files directly in your browser with Toolvero. Free image, video, audio, PDF, and file utilities.',
      canonicalUrl: 'https://toolvero.com/',
      keywords: [
        'online tools',
        'image compressor',
        'pdf converter',
        'mp4 to mp3',
        'free file tools',
        'toolvero',
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Toolvero',
        'url': 'https://toolvero.com/',
        'description': 'Powerful Online Tools. Simple & Fast.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://toolvero.com/tools?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    });

    analytics.trackPageView('/', 'Toolvero - Homepage');
  }, []);

  const handleSelectTool = (tool: ToolDefinition) => {
    onNavigate(tool.route);
  };

  const handleSelectCategory = (cat: CategoryDefinition) => {
    onNavigate(cat.route);
  };

  const handleQuickQuery = (query: string) => {
    onNavigate(`/tools?q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <Hero
        onSearchClick={onOpenSearch}
        onExploreTools={() => onNavigate('/tools')}
        onPopularTools={() => {
          const el = document.getElementById('popular-tools');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onQuickQuery={handleQuickQuery}
      />

      {/* Popular Tools Section */}
      <PopularTools
        onSelectTool={handleSelectTool}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Reserved Monetization Placement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <AdBanner format="leaderboard" />
      </div>

      {/* Category Section */}
      <CategorySection onSelectCategory={handleSelectCategory} />

      {/* Why Toolvero Trust Section */}
      <TrustSection />
    </div>
  );
};
