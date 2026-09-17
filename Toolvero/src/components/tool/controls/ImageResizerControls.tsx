import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Maximize2 } from 'lucide-react';

interface ImageResizerControlsProps {
  originalWidth?: number;
  originalHeight?: number;
  onResize: (options: { width: number; height: number; format: string }) => void;
  isProcessing: boolean;
}

export const ImageResizerControls: React.FC<ImageResizerControlsProps> = ({
  originalWidth = 1200,
  originalHeight = 800,
  onResize,
  isProcessing,
}) => {
  const [width, setWidth] = useState(originalWidth);
  const [height, setHeight] = useState(originalHeight);
  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState('image/jpeg');

  useEffect(() => {
    if (originalWidth && originalHeight) {
      setWidth(originalWidth);
      setHeight(originalHeight);
    }
  }, [originalWidth, originalHeight]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const applyPreset = (percentage: number) => {
    if (originalWidth && originalHeight) {
      const scale = percentage / 100;
      setWidth(Math.round(originalWidth * scale));
      setHeight(Math.round(originalHeight * scale));
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Maximize2 className="w-4 h-4 text-brand-500" />
          <span>Dimension Settings</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Original: {originalWidth} &times; {originalHeight} px
        </div>
      </div>

      {/* Quick scale pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-medium mr-1">Presets:</span>
        {[25, 50, 75, 100, 150, 200].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => applyPreset(p)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {p}%
          </button>
        ))}
      </div>

      {/* Width and Height Inputs with Aspect Lock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Target Width (px)
          </label>
          <input
            type="number"
            value={width}
            min={1}
            max={10000}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="w-full px-3.5 py-2 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Target Height (px)
          </label>
          <input
            type="number"
            value={height}
            min={1}
            max={10000}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            className="w-full px-3.5 py-2 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
          <input
            type="checkbox"
            checked={lockRatio}
            onChange={(e) => setLockRatio(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          {lockRatio ? <Lock className="w-3.5 h-3.5 text-brand-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
          <span>Lock Aspect Ratio</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Format:</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => onResize({ width, height, format })}
        disabled={isProcessing || width <= 0 || height <= 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
      >
        <Maximize2 className="w-4 h-4" />
        <span>Resize Image</span>
      </button>
    </div>
  );
};
