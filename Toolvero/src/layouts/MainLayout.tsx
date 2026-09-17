import React, { ReactNode } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { SearchModal } from '../components/common/SearchModal';
import { Toast, ToastMessage } from '../components/common/Toast';
import { useTheme } from '../hooks/useTheme';
import { useSearch } from '../hooks/useSearch';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentTools } from '../hooks/useRecentTools';
import { TOOLS } from '../data/tools';
import { ToolDefinition } from '../types/tool';

interface MainLayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  toasts,
  onDismissToast,
}) => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { isOpen, setIsOpen, query, setQuery, results, openSearch, closeSearch } = useSearch();
  const { favorites } = useFavorites();
  const { recentTools } = useRecentTools();

  const handleSelectTool = (tool: ToolDefinition) => {
    closeSearch();
    onNavigate(tool.route);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-light text-slate-900 dark:bg-surface-darker dark:text-slate-100 transition-colors duration-200">
      {/* Sticky Header */}
      <Header
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenSearch={openSearch}
        theme={theme}
        resolvedTheme={resolvedTheme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Global Search Dialog (Ctrl+K) */}
      <SearchModal
        isOpen={isOpen}
        onClose={closeSearch}
        query={query}
        setQuery={setQuery}
        results={results}
        onSelectTool={handleSelectTool}
        recentTools={recentTools}
        favorites={favorites}
        allTools={TOOLS}
      />

      {/* System Toast Notifications */}
      <Toast toasts={toasts} onDismiss={onDismissToast} />

      {/* Structured Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
