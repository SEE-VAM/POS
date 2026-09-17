/**
 * Safe and modern file helpers for Toolvero
 */

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function sanitizeFilename(filename: string, replacementExt?: string): string {
  // Remove dangerous path traversal and special characters
  const cleanName = filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
  if (replacementExt) {
    const base = cleanName.substring(0, cleanName.lastIndexOf('.')) || cleanName;
    return `${base}.${replacementExt.replace(/^\./, '')}`;
  }
  return cleanName;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

export function validateFileType(file: File, supportedFormats: string[]): boolean {
  if (supportedFormats.includes('*/*')) return true;
  
  const fileType = file.type.toLowerCase();
  const fileExt = `.${getFileExtension(file.name)}`;

  return supportedFormats.some(format => {
    const fmt = format.toLowerCase();
    if (fmt.startsWith('.')) {
      return fileExt === fmt;
    }
    if (fmt.endsWith('/*')) {
      const prefix = fmt.replace('/*', '');
      return fileType.startsWith(prefix);
    }
    return fileType === fmt;
  });
}

export function validateFileSize(file: File, maxMb: number): boolean {
  const maxBytes = maxMb * 1024 * 1024;
  return file.size <= maxBytes;
}

export function calculateSavings(originalSize: number, newSize: number): number {
  if (!originalSize || originalSize <= 0) return 0;
  if (newSize >= originalSize) return 0;
  const savings = ((originalSize - newSize) / originalSize) * 100;
  return Math.round(savings * 10) / 10;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
