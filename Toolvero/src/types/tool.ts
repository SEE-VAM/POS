export type ToolCategory = 'image' | 'video' | 'audio' | 'pdf' | 'file';

export type ToolEngine = 'browser' | 'cloud-ready';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  shortDescription: string;
  icon: string; // Lucide icon identifier
  route: string;
  supportedFormats: string[];
  maxFileSizeMB: number;
  engine: ToolEngine;
  engineNotice?: string;
  isPopular?: boolean;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  features: string[];
  howToSteps: HowToStep[];
  faqs: FAQItem[];
}

export interface CategoryDefinition {
  id: ToolCategory;
  name: string;
  slug: string;
  route: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

export interface ProcessingFile {
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  dimensions?: { width: number; height: number };
}

export interface ProcessResult {
  blob: Blob;
  downloadUrl: string;
  filename: string;
  originalSize: number;
  processedSize: number;
  savingsPercentage: number;
  metadata?: Record<string, any>;
}

export type ProcessingStatus = 'idle' | 'uploading' | 'ready' | 'processing' | 'success' | 'error';
