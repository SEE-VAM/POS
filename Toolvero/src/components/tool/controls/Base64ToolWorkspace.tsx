import React, { useState } from 'react';
import { Binary, Copy, Check, Download, ArrowDownUp } from 'lucide-react';
import { fileToBase64, base64ToBlob } from '../../../services/fileProcessor';

export const Base64ToolWorkspace: React.FC = () => {
  const [tab, setTab] = useState<'encode' | 'decode'>('encode');
  const [rawText, setRawText] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [copied, setCopied] = useState(false);

  // Encoding Handler
  const handleEncodeText = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(rawText)));
      setBase64Output(encoded);
    } catch (e: any) {
      alert('Encoding failed: ' + e.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const { dataUri } = await fileToBase64(file);
      setBase64Output(dataUri);
    }
  };

  // Decoding Handler
  const handleDecodeText = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(rawText.trim())));
      setBase64Output(decoded);
    } catch (e: any) {
      alert('Invalid Base64 input string: ' + e.message);
    }
  };

  const handleDownloadDecodedBlob = () => {
    try {
      const blob = base64ToBlob(rawText);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded_file.bin';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Failed to construct file from Base64: ' + e.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64Output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => { setTab('encode'); setRawText(''); setBase64Output(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === 'encode'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Encode to Base64
          </button>
          <button
            onClick={() => { setTab('decode'); setRawText(''); setBase64Output(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === 'decode'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Decode from Base64
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {tab === 'encode' ? 'Input Text or Choose File to Encode' : 'Input Base64 String to Decode'}
        </label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={
            tab === 'encode'
              ? 'Enter raw text to encode...'
              : 'Paste standard Base64 string or data:image/... URI here...'
          }
          rows={5}
          className="w-full p-3.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {tab === 'encode' && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-slate-400">or encode file:</span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-300"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={tab === 'encode' ? handleEncodeText : handleDecodeText}
          disabled={!rawText.trim()}
          className="flex-1 py-3 px-6 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {tab === 'encode' ? 'Encode to Base64' : 'Decode Base64'}
        </button>

        {tab === 'decode' && rawText.trim() && (
          <button
            onClick={handleDownloadDecodedBlob}
            className="inline-flex items-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Save as File</span>
          </button>
        )}
      </div>

      {base64Output && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Result Output</span>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 select-all">
            {base64Output}
          </div>
        </div>
      )}
    </div>
  );
};
