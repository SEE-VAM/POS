import React, { useState } from 'react';
import { ArrowRightLeft, Sparkles } from 'lucide-react';

interface FormatConverterControlsProps {
  sourceType: string;
  defaultTarget: 'image/png' | 'image/jpeg' | 'image/webp';
  onConvert: (options: { targetFormat: any; quality: number; backgroundColor: string }) => void;
  isProcessing: boolean;
}

export const FormatConverterControls: React.FC<FormatConverterControlsProps> = ({
  sourceType,
  defaultTarget,
  onConvert,
  isProcessing,
}) => {
  const [targetFormat, setTargetFormat] = useState(defaultTarget);
  const [quality, setQuality] = useState(90);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white">
        <ArrowRightLeft className="w-4 h-4 text-brand-500" />
        <span>Conversion Settings</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Target Format
          </label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as any)}
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="image/png">PNG (Lossless with alpha)</option>
            <option value="image/jpeg">JPG / JPEG (Compact)</option>
            <option value="image/webp">WebP (Modern high-efficiency)</option>
          </select>
        </div>

        {targetFormat !== 'image/png' ? (
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Encoding Quality</span>
              <span className="font-mono text-brand-600 dark:text-brand-400">{quality}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Compression Mode
            </label>
            <div className="p-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              Lossless 24-bit RGB with alpha channel support.
            </div>
          </div>
        )}
      </div>

      {targetFormat === 'image/jpeg' && (
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
          <span className="text-amber-800 dark:text-amber-300">
            JPG does not support transparency. Transparent areas will be filled with:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-slate-300"
            />
            <span className="font-mono text-slate-600 dark:text-slate-400">{backgroundColor}</span>
          </div>
        </div>
      )}

      <button
        onClick={() => onConvert({ targetFormat, quality, backgroundColor })}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>Convert Image</span>
      </button>
    </div>
  );
};
