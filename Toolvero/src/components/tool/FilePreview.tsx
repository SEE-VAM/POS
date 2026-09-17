import React from 'react';
import { X, File, FileText, Image as ImageIcon, Video, Music } from 'lucide-react';
import { formatBytes } from '../../utils/fileHelpers';

interface FilePreviewProps {
  file: File;
  previewUrl?: string;
  onRemove: () => void;
  disabled?: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  previewUrl,
  onRemove,
  disabled = false,
}) => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isPdf = file.type === 'application/pdf';

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Preview thumbnail or Icon */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          {isImage && previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : isImage ? (
            <ImageIcon className="w-6 h-6 text-blue-500" />
          ) : isVideo ? (
            <Video className="w-6 h-6 text-purple-500" />
          ) : isAudio ? (
            <Music className="w-6 h-6 text-emerald-500" />
          ) : isPdf ? (
            <FileText className="w-6 h-6 text-rose-500" />
          ) : (
            <File className="w-6 h-6 text-slate-500" />
          )}
        </div>

        {/* Details with long filename safety */}
        <div className="min-w-0">
          <p
            className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md md:max-w-lg"
            title={file.name}
          >
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatBytes(file.size)}</span>
            <span>&bull;</span>
            <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
              {file.type || 'Binary'}
            </span>
          </div>
        </div>
      </div>

      {/* Remove / Replace Button */}
      <button
        onClick={onRemove}
        disabled={disabled}
        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 disabled:opacity-40"
        aria-label="Remove file"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
