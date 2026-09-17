export type AnalyticsEvent = 
  | { name: 'page_view'; properties: { path: string; title: string } }
  | { name: 'tool_used'; properties: { toolId: string; toolName: string; fileSize?: number; durationMs?: number; success: boolean } }
  | { name: 'file_downloaded'; properties: { toolId: string; format: string; sizeReductionPercent?: number } }
  | { name: 'search_performed'; properties: { query: string; resultsCount: number } }
  | { name: 'favorite_toggled'; properties: { toolId: string; isFavorite: boolean } };

export interface AnalyticsService {
  init: () => void;
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (path: string, title: string) => void;
}
