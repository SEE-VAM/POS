import React, { useEffect } from 'react';
import { updatePageMeta } from '../utils/seoHelpers';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    updatePageMeta({
      title: 'Terms of Service — Toolvero Online Utilities',
      description: 'Terms and conditions governing the use of Toolvero online conversion and utility services.',
      canonicalUrl: 'https://toolvero.com/terms',
    });
  }, []);

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Last Updated: September 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Toolvero (&ldquo;the Website&rdquo;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Acceptable Use</h2>
            <p>
              You agree to use Toolvero only for legitimate file conversion, editing, and utility purposes. You agree not to use the platform to transmit malicious code, copyright-infringing materials, or unlawful content.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Intellectual Property Rights</h2>
            <p>
              You retain 100% full and unconditional ownership of all files and media you process using Toolvero. Toolvero claims zero ownership, license, or distribution rights over your content.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Availability &amp; Modifications</h2>
            <p>
              Toolvero reserves the right to enhance, modify, or update tool features without prior notice. The service is provided &ldquo;as is&rdquo; without warranties of any kind.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
