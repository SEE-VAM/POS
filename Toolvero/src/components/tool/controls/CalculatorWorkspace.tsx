import React, { useState } from 'react';
import { Calculator, Wifi, HardDrive, ArrowRight } from 'lucide-react';
import { calculateBandwidthEstimates } from '../../../services/fileProcessor';

export const CalculatorWorkspace: React.FC = () => {
  const [sizeInput, setSizeInput] = useState<number>(500);
  const [unit, setUnit] = useState<'MB' | 'GB' | 'KB' | 'TB'>('MB');

  // Convert to bytes
  let multiplier = 1024 * 1024;
  if (unit === 'KB') multiplier = 1024;
  if (unit === 'GB') multiplier = 1024 * 1024 * 1024;
  if (unit === 'TB') multiplier = 1024 * 1024 * 1024 * 1024;

  const totalBytes = (sizeInput || 0) * multiplier;
  const estimates = calculateBandwidthEstimates(totalBytes);

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-8">
      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Enter File Size
          </label>
          <input
            type="number"
            min="0.1"
            step="any"
            value={sizeInput}
            onChange={(e) => setSizeInput(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 rounded-xl text-base font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="w-full sm:w-44">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl text-base font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="KB">Kilobytes (KB)</option>
            <option value="MB">Megabytes (MB)</option>
            <option value="GB">Gigabytes (GB)</option>
            <option value="TB">Terabytes (TB)</option>
          </select>
        </div>
      </div>

      {/* Unit Conversion Grid */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Equivalent Data Sizes
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-400">Kilobytes</div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
              {estimates.kb.toLocaleString(undefined, { maximumFractionDigits: 1 })} KB
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-400">Megabytes</div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
              {estimates.mb.toLocaleString(undefined, { maximumFractionDigits: 2 })} MB
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-400">Gigabytes</div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
              {estimates.gb.toLocaleString(undefined, { maximumFractionDigits: 3 })} GB
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-400">Bytes</div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
              {estimates.bytes.toLocaleString()} B
            </div>
          </div>
        </div>
      </div>

      {/* Transfer time table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="w-4 h-4 text-brand-500" />
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Estimated Download / Upload Times
          </h4>
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
          {[
            { name: 'Gigabit Fiber Internet', speed: '1000 Mbps (1 Gbps)', time: estimates.downloadTimes.gigabitFiber },
            { name: '5G Mobile Ultra Wideband', speed: '300 Mbps', time: estimates.downloadTimes.fiveG },
            { name: 'Broadband Cable / Wi-Fi', speed: '100 Mbps', time: estimates.downloadTimes.broadband100M },
            { name: '4G LTE Mobile Network', speed: '25 Mbps', time: estimates.downloadTimes.fourGLte },
            { name: 'DSL / Standard Connection', speed: '10 Mbps', time: estimates.downloadTimes.dsl10M },
          ].map((row) => (
            <div key={row.name} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{row.name}</span>
                <span className="text-slate-400 ml-2 font-mono text-xs hidden sm:inline">({row.speed})</span>
              </div>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg">
                {row.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
