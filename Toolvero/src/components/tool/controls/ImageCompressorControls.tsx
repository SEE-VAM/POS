import React from 'react';
import { Sliders, Sparkles } from 'lucide-react';

interface ImageCompressorControlsProps {
  quality: number;
  setQuality: (q: number) => void;
  format: string;
  setFormat: (f: string) => void;
  onCompress: () => void;
  isProcessing: boolean;
}

export const ImageCompressorControls: React.FC<ImageCompressorControlsProps> = ({
  quality,
  setQuality,
  format,
  setFormat,
  onCompress,
  isProcessing,
}) => {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white">
        <Sliders className="w-4 h-4 text-brand-500" />
        <span>Compression Settings</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Quality Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Quality Level</span>
            <span className="font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
              {quality}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Smallest Size (10%)</span>
            <span>Balanced (80%)</span>
            <span>Best Quality (100%)</span>
          </div>
        </div>

        {/* Output Format Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Output Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="original">Keep Original Format</option>
            <option value="image/jpeg">JPG / JPEG (Universal)</option>
            <option value="image/png">PNG (Lossless)</option>
            <option value="image/webp">WebP (Smallest file size)</option>
          </select>
          <p className="text-[11px] text-slate-400">
            WebP provides up to 35% higher compression efficiency than JPG.
          </p>
        </div>
      </div>

      <button
        onClick={onCompress}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>Compress Image</span>
      </button>
    </div>
  );
};
