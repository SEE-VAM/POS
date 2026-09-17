import { ToolDefinition } from '../types/tool';

export interface SeoProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogImage?: string;
  structuredData?: Record<string, any>;
}

export function updatePageMeta({
  title,
  description,
  canonicalUrl = window.location.href,
  keywords = [],
  ogImage = 'https://toolvero.com/og-image.png',
  structuredData,
}: SeoProps) {
  // Update document title
  document.title = title;

  // Helper to set or create meta tag
  const setMeta = (name: string, content: string, isProperty: boolean = false) => {
    const attr = isProperty ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  setMeta('description', description);
  if (keywords.length > 0) {
    setMeta('keywords', keywords.join(', '));
  }

  // Open Graph
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('og:image', ogImage, true);

  // Twitter
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', ogImage);

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  // JSON-LD Structured Data
  const oldScript = document.getElementById('json-ld-data');
  if (oldScript) {
    oldScript.remove();
  }

  if (structuredData) {
    const script = document.createElement('script');
    script.id = 'json-ld-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
}

export function generateToolStructuredData(tool: ToolDefinition) {
  const schema: Record<string, any>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': tool.name,
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'All',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'description': tool.description,
      'url': `https://toolvero.com${tool.route}`,
    }
  ];

  if (tool.howToSteps && tool.howToSteps.length > 0) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': `How to use ${tool.name}`,
      'step': tool.howToSteps.map(s => ({
        '@type': 'HowToStep',
        'position': s.step,
        'name': s.title,
        'text': s.description,
      }))
    });
  }

  if (tool.faqs && tool.faqs.length > 0) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': tool.faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer,
        }
      }))
    });
  }

  return schema;
}
