import { useState, useEffect, useMemo } from 'react';
import { TOOLS } from '../data/tools';
import { ToolDefinition } from '../types/tool';

export function useSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const terms = query.toLowerCase().trim().split(/\s+/);

    return TOOLS.filter(tool => {
      const targetString = [
        tool.name,
        tool.category,
        tool.shortDescription,
        tool.description,
        ...(tool.keywords || []),
      ]
        .join(' ')
        .toLowerCase();

      return terms.every(term => targetString.includes(term));
    });
  }, [query]);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    results,
    openSearch: () => setIsOpen(true),
    closeSearch: () => {
      setIsOpen(false);
      setQuery('');
    },
  };
}
