import React, { useState } from 'react';
import { Cloud, Terminal, AlertCircle, Settings2, Sparkles, Server } from 'lucide-react';
import { ToolDefinition } from '../../../types/tool';

interface CloudToolNoticeProps {
  tool: ToolDefinition;
  file?: File;
}

export const CloudToolNotice: React.FC<CloudToolNoticeProps> = ({ tool, file }) => {
  const [targetPreset, setTargetPreset] = useState('balanced');
  const [customBitrate, setCustomBitrate] = useState('192k');

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-card space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
          <Server className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cloud Engine Integration Ready
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Processing engine coming soon
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            High-throughput media processing for {tool.name} is architected for asynchronous backend execution via Toolvero&apos;s modular API service.
          </p>
        </div>
      </div>

      {/* Parameter Configuration Preview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Settings2 className="w-4 h-4 text-brand-500" />
          <span>Configurable Pipeline Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Processing Profile
            </label>
            <select
              value={targetPreset}
              onChange={(e) => setTargetPreset(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="balanced">Balanced (Recommended)</option>
              <option value="maximum_compression">Maximum Compression</option>
              <option value="high_fidelity">Studio / High Fidelity</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Encoding Bitrate Target
            </label>
            <select
              value={customBitrate}
              onChange={(e) => setCustomBitrate(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="128k">128 kbps (Voice / Mobile)</option>
              <option value="192k">192 kbps (Standard Quality)</option>
              <option value="320k">320 kbps (Lossless CD Quality)</option>
            </select>
          </div>
        </div>

        {file && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-slate-600 dark:text-slate-400">
            <div>Validated Payload: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</div>
            <div>Target Endpoint: POST /api/v1/process?tool={tool.id}</div>
          </div>
        )}
      </div>

      {/* Backend Connection Instructions */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 text-xs font-mono space-y-2">
        <div className="flex items-center gap-1.5 text-brand-400 font-semibold">
          <Terminal className="w-4 h-4" />
          <span>FastAPI Backend Connection Guide</span>
        </div>
        <p className="text-slate-400">
          To connect the production transcode cluster, configure your environment variable in <code className="text-amber-300">.env</code>:
        </p>
        <div className="p-2.5 rounded-lg bg-black/40 text-emerald-400 select-all">
          VITE_BACKEND_API_URL=https://api.toolvero.com
        </div>
      </div>
    </div>
  );
};
