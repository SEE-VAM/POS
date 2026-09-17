import React, { useEffect } from 'react';
import { ShieldCheck, Zap, Lock, Globe, Users, Heart } from 'lucide-react';
import { updatePageMeta } from '../utils/seoHelpers';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    updatePageMeta({
      title: 'About Toolvero — Powerful Online Tools. Simple & Fast.',
      description: 'Learn about Toolvero, our mission to create private, blazing fast in-browser file utilities for students, developers, and creators worldwide.',
      canonicalUrl: 'https://toolvero.com/about',
    });
  }, []);

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            About <span className="text-brand-600 dark:text-brand-400">Toolvero</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Building the next generation of web utilities: fast, private, accessible, and completely free of spam.
          </p>
        </div>

        {/* Mission Card */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Our Mission
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
            Most online converters and utility websites today are bogged down by intrusive pop-up ads, slow server queues, forced email registrations, and sketchy privacy practices.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
            <strong>Toolvero</strong> was created to change that. By leveraging modern browser APIs (such as HTML5 Canvas, Web Crypto, and WebAssembly), we process images and documents directly on your device whenever possible. Your confidential files never touch our servers, guaranteeing 100% privacy and lightning-fast speed.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Privacy First</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Files are processed in memory and never logged, retained, or mined for advertising.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 mx-auto flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Instant Speed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No server upload wait times. Instant client-side computation renders results in milliseconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 mx-auto flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Universal Access</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Optimized for mobile smartphones, tablets, laptops, and ultra-wide desktop monitors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
