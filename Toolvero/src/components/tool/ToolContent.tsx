import React from 'react';
import { ToolDefinition } from '../../types/tool';
import { CheckCircle2, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { FaqAccordion } from '../common/FaqAccordion';

interface ToolContentProps {
  tool: ToolDefinition;
}

export const ToolContent: React.FC<ToolContentProps> = ({ tool }) => {
  return (
    <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 space-y-16">
      {/* What is this tool? */}
      <section aria-labelledby="about-tool-heading">
        <h2 id="about-tool-heading" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
          What is the {tool.name}?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed max-w-3xl">
          {tool.description}
        </p>

        {tool.features && tool.features.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Key Capabilities &amp; Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tool.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* How to use */}
      <section aria-labelledby="how-to-use-heading">
        <h2 id="how-to-use-heading" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          How to Use the {tool.name}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
          Follow these 4 simple steps to optimize your files in seconds.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tool.howToSteps.map((step) => (
            <div
              key={step.step}
              className="relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 font-bold text-sm mb-4 border border-brand-200/60 dark:border-brand-800/60">
                  {step.step}
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <FaqAccordion
        items={tool.faqs}
        title={`${tool.name} FAQs`}
        subtitle="Common questions regarding file formats, privacy, quality retention, and limits."
      />
    </div>
  );
};
