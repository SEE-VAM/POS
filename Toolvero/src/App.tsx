import React, { useState, useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ToolsCatalogPage } from './pages/ToolsCatalogPage';
import { CategoryPage } from './pages/CategoryPage';
import { ToolDetailPage } from './pages/ToolDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TOOLS } from './data/tools';
import { CATEGORIES } from './data/categories';
import { useFavorites } from './hooks/useFavorites';
import { useRecentTools } from './hooks/useRecentTools';
import { ToastMessage } from './components/common/Toast';
import { analytics } from './services/analytics';

export function App() {
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    if (window.location.hash) {
      return window.location.hash.replace(/^#/, '') || '/';
    }
    const path = window.location.pathname || '/';
    const normalized = path.replace(/\/index\.html$/i, '').replace(/\/$/, '') || '/';
    return normalized;
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { favorites, toggleFavorite } = useFavorites();
  const { addRecentTool } = useRecentTools();

  // Initialize analytics on app mount
  useEffect(() => {
    analytics.init();
  }, []);

  // Handle browser back / forward navigation and hash changes
  useEffect(() => {
    const onLocationChange = () => {
      if (window.location.hash) {
        setCurrentPath(window.location.hash.replace(/^#/, '') || '/');
      } else {
        const path = window.location.pathname || '/';
        setCurrentPath(path.replace(/\/index\.html$/i, '').replace(/\/$/, '') || '/');
      }
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    if (window.location.protocol === 'file:') {
      window.location.hash = path;
    } else {
      window.history.pushState({}, '', path);
    }
    const clean = path.split('?')[0].replace(/\/index\.html$/i, '').replace(/\/$/, '') || '/';
    setCurrentPath(clean);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Route Resolver
  const renderRoute = () => {
    let cleanPath = currentPath.replace(/\/index\.html$/i, '').replace(/\/$/, '') || '/';
    if (cleanPath.startsWith('#')) {
      cleanPath = cleanPath.substring(1) || '/';
    }

    // 1. Core pages
    if (cleanPath === '/') {
      return (
        <HomePage
          onNavigate={navigate}
          onOpenSearch={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
            window.dispatchEvent(event);
          }}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (cleanPath === '/tools') {
      return (
        <ToolsCatalogPage
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    // 2. Category Pages
    if (cleanPath === '/image-tools') {
      return (
        <CategoryPage
          categoryId="image"
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (cleanPath === '/video-tools') {
      return (
        <CategoryPage
          categoryId="video"
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (cleanPath === '/audio-tools') {
      return (
        <CategoryPage
          categoryId="audio"
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (cleanPath === '/pdf-tools') {
      return (
        <CategoryPage
          categoryId="pdf"
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    if (cleanPath === '/file-tools') {
      return (
        <CategoryPage
          categoryId="file"
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    // 3. Static & Legal Pages
    if (cleanPath === '/about') {
      return <AboutPage />;
    }

    if (cleanPath === '/contact') {
      return <ContactPage />;
    }

    if (cleanPath === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }

    if (cleanPath === '/terms') {
      return <TermsPage />;
    }

    if (cleanPath === '/disclaimer') {
      return <DisclaimerPage />;
    }

    // 4. Individual Tool Pages (/tools/:slug)
    if (cleanPath.startsWith('/tools/')) {
      const toolSlug = cleanPath.replace('/tools/', '');
      const tool = TOOLS.find((t) => t.slug === toolSlug || t.id === toolSlug);

      if (tool) {
        return (
          <ToolDetailPage
            tool={tool}
            onNavigate={navigate}
            isFavorite={favorites.includes(tool.id)}
            onToggleFavorite={toggleFavorite}
            onAddRecentTool={addRecentTool}
            onShowToast={showToast}
          />
        );
      }
    }

    // 5. Fallback 404
    return (
      <NotFoundPage
        onNavigate={navigate}
        onOpenSearch={() => {
          const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
          window.dispatchEvent(event);
        }}
      />
    );
  };

  return (
    <MainLayout
      currentPath={currentPath}
      onNavigate={navigate}
      toasts={toasts}
      onDismissToast={dismissToast}
    >
      {renderRoute()}
    </MainLayout>
  );
}

export default App;
