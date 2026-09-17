import React, { useState } from 'react';
import { Music, Sparkles, Volume2, Sliders } from 'lucide-react';

interface Mp4ToMp3ControlsProps {
  onConvert: (options: { bitrate: string; format: string }) => void;
  isProcessing: boolean;
}

export const Mp4ToMp3Controls: React.FC<Mp4ToMp3ControlsProps> = ({ onConvert, isProcessing }) => {
  const [bitrate, setBitrate] = useState('320k');
  const [format, setFormat] = useState('mp3');

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white">
        <Music className="w-4 h-4 text-brand-500" />
        <span>MP4 to MP3 Extraction Settings</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Target Audio Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="mp3">MP3 (Universal - 320 kbps)</option>
            <option value="wav">WAV (Lossless Uncompressed)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Audio Quality (Bitrate)
          </label>
          <select
            value={bitrate}
            onChange={(e) => setBitrate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="320k">320 kbps (High Fidelity Studio)</option>
            <option value="192k">192 kbps (Standard Quality)</option>
            <option value="128k">128 kbps (Compact / Speech)</option>
          </select>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-xs text-brand-800 dark:text-brand-300 flex items-center gap-2.5">
        <Volume2 className="w-4 h-4 text-brand-500 shrink-0" />
        <span>Extracts and decodes the native AAC audio track directly in your browser with zero quality degradation.</span>
      </div>

      <button
        onClick={() => onConvert({ bitrate, format })}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>Extract &amp; Convert to MP3</span>
      </button>
    </div>
  );
};
