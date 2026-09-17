import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Heart, Clock, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ToolDefinition } from '../../types/tool';
import { DynamicIcon } from './DynamicIcon';
import { POPULAR_TOOLS } from '../../data/tools';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (query: string) => void;
  results: ToolDefinition[];
  onSelectTool: (tool: ToolDefinition) => void;
  recentTools: ToolDefinition[];
  favorites: string[];
  allTools: ToolDefinition[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  query,
  setQuery,
  results,
  onSelectTool,
  recentTools,
  favorites,
  allTools,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Favorite tools objects
  const favoriteTools = allTools.filter(t => favorites.includes(t.id));

  // Determine current display list for keyboard navigation
  const currentList = query.trim() ? results : (recentTools.length > 0 ? recentTools : POPULAR_TOOLS);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, currentList.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + currentList.length) % Math.max(1, currentList.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentList[selectedIndex]) {
        onSelectTool(currentList[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search tools"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tools (e.g., compress, resize, pdf, mp3)..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            aria-label="Close search"
          >
            <kbd className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 font-mono">
              ESC
            </kbd>
          </button>
        </div>

        {/* Results / Discovery Lists */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {query.trim() ? (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Matching Tools ({results.length})
              </div>
              {results.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-sm">No tools found matching &ldquo;{query}&rdquo;.</p>
                  <p className="text-xs mt-1 text-slate-400">Try searching for &ldquo;image&rdquo;, &ldquo;pdf&rdquo;, or &ldquo;compress&rdquo;.</p>
                </div>
              ) : (
                <div className="space-y-1 mt-1">
                  {results.map((tool, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            <DynamicIcon name={tool.icon} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate flex items-center gap-2">
                              {tool.name}
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {tool.category}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {tool.shortDescription}
                            </div>
                          </div>
                        </div>
                        <CornerDownLeft className={`w-4 h-4 shrink-0 transition-opacity ${isSelected ? 'opacity-100 text-brand-500' : 'opacity-0'}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recently Used Section */}
              {recentTools.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    Recently Visited
                  </div>
                  <div className="space-y-1 mt-1">
                    {recentTools.map((tool, idx) => (
                      <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <DynamicIcon name={tool.icon} className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                            {tool.name}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites Section */}
              {favoriteTools.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Your Favorites
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {favoriteTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/40 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 text-left transition-colors"
                      >
                        <DynamicIcon name={tool.icon} className="w-4 h-4 text-brand-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {tool.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tools Quick Section */}
              <div>
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Popular Tools
                </div>
                <div className="space-y-1 mt-1">
                  {POPULAR_TOOLS.slice(0, 5).map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => onSelectTool(tool)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-brand-600 dark:text-brand-400">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                            {tool.name}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {tool.shortDescription}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with <kbd className="px-1 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">↑</kbd> <kbd className="px-1 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">↓</kbd></span>
          <span>Select with <kbd className="px-1 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">Enter</kbd></span>
        </div>
      </div>
    </div>
  );
};
