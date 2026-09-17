import { AnalyticsEvent, AnalyticsService } from '../types/analytics';

class ToolveroAnalytics implements AnalyticsService {
  private isInitialized = false;
  private measurementId: string | null = null;

  init() {
    if (this.isInitialized) return;
    
    // Read from environment variable (Vite prefix)
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || null;

    if (this.measurementId && typeof window !== 'undefined') {
      // In production, load the Google Analytics gtag.js script safely
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      // Initialize dataLayer
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', this.measurementId, { send_page_view: false });
    }

    this.isInitialized = true;
  }

  trackPageView(path: string, title: string) {
    if (typeof window !== 'undefined' && (window as any).gtag && this.measurementId) {
      (window as any).gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
      });
    } else {
      // Local dev telemetry log
      if (import.meta.env.DEV) {
        console.debug(`[Analytics] PageView: ${path} - ${title}`);
      }
    }
  }

  trackEvent(event: AnalyticsEvent) {
    if (typeof window !== 'undefined' && (window as any).gtag && this.measurementId) {
      (window as any).gtag('event', event.name, (event as any).properties);
    } else {
      if (import.meta.env.DEV) {
        console.debug(`[Analytics] Event: ${event.name}`, (event as any).properties);
      }
    }
  }
}

export const analytics = new ToolveroAnalytics();
