import { useState, useEffect } from 'react';
import { ToolDefinition } from '../types/tool';
import { TOOLS } from '../data/tools';

const STORAGE_KEY = 'toolvero_recent_tools';
const MAX_RECENTS = 6;

export function useRecentTools() {
  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentToolIds));
    } catch (e) {
      console.warn('Could not save recent tools to localStorage', e);
    }
  }, [recentToolIds]);

  const addRecentTool = (toolId: string) => {
    setRecentToolIds(prev => {
      const filtered = prev.filter(id => id !== toolId);
      return [toolId, ...filtered].slice(0, MAX_RECENTS);
    });
  };

  const recentTools: ToolDefinition[] = recentToolIds
    .map(id => TOOLS.find(t => t.id === id))
    .filter((t): t is ToolDefinition => Boolean(t));

  return { recentTools, addRecentTool };
}
