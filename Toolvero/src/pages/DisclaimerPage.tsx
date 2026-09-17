import React, { useEffect } from 'react';
import { updatePageMeta } from '../utils/seoHelpers';

export const DisclaimerPage: React.FC = () => {
  useEffect(() => {
    updatePageMeta({
      title: 'Disclaimer — Toolvero File Utilities',
      description: 'Legal disclaimer and limitation of liability regarding file operations on Toolvero.',
      canonicalUrl: 'https://toolvero.com/disclaimer',
    });
  }, []);

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Disclaimer
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Last Updated: September 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. General Information</h2>
            <p>
              The tools and information provided on Toolvero are intended solely for general productivity, personal, academic, and business utility purposes. While we strive for maximum accuracy, fidelity, and reliability, we make no guarantees that processed outputs will meet all specific compliance standards or device constraints.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Backup Recommendation</h2>
            <p>
              Always maintain independent backup copies of critical documents, media, or archives before performing destructive compression or format transformations. Toolvero shall not be held liable for any accidental loss of original source files.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Third-Party Trademarks</h2>
            <p>
              All referenced file formats, extensions, and standard identifiers (such as MP4, MP3, PDF, JPEG, WebP, Apple QuickTime, Discord, etc.) are trademarks or registered trademarks of their respective copyright holders. Reference to them does not imply endorsement or affiliation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
