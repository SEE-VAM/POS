import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, FileCode, Type } from 'lucide-react';
import { generateFileHash } from '../../../services/fileProcessor';

export const HashToolWorkspace: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-512' | 'SHA-1'>('SHA-256');
  const [hashResult, setHashResult] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateHash = async () => {
    setIsCalculating(true);
    try {
      if (mode === 'text') {
        const hash = await generateFileHash(textInput, algorithm);
        setHashResult(hash);
      } else if (selectedFile) {
        const hash = await generateFileHash(selectedFile, algorithm);
        setHashResult(hash);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hashResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => { setMode('text'); setHashResult(''); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'text'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text Input</span>
          </button>
          <button
            onClick={() => { setMode('file'); setHashResult(''); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'file'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>File Checksum</span>
          </button>
        </div>

        {/* Algorithm Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Algorithm:</span>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="SHA-256">SHA-256 (Industry Standard)</option>
            <option value="SHA-512">SHA-512 (High Security)</option>
            <option value="SHA-1">SHA-1 (Legacy)</option>
          </select>
        </div>
      </div>

      {/* Input section */}
      {mode === 'text' ? (
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Enter String or Raw Text
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type or paste any text to hash..."
            rows={4}
            className="w-full p-3 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Select Any File
          </label>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-slate-800 dark:file:text-slate-200"
          />
          {selectedFile && (
            <p className="mt-2 text-xs text-slate-500 font-mono">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      )}

      <button
        onClick={calculateHash}
        disabled={isCalculating || (mode === 'text' && !textInput) || (mode === 'file' && !selectedFile)}
        className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
      >
        {isCalculating ? 'Computing Hash...' : `Generate ${algorithm} Hash`}
      </button>

      {/* Result Display */}
      {hashResult && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="uppercase">{algorithm} Checksum Digest</span>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 select-all">
            {hashResult}
          </div>
        </div>
      )}
    </div>
  );
};
