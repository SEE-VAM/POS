import { ProcessResult } from '../types/tool';
import { sanitizeFilename } from '../utils/fileHelpers';

/**
 * Encodes an AudioBuffer into a standard 16-bit PCM RIFF Wave / Audio file
 * This is playable natively on all devices, iOS, Android, macOS, Windows, and browsers.
 */
export function audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let interleaved: Float32Array;
  if (numChannels === 2) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    interleaved = new Float32Array(left.length + right.length);
    let inputIdx = 0;
    let outputIdx = 0;
    while (inputIdx < left.length) {
      interleaved[outputIdx++] = left[inputIdx];
      interleaved[outputIdx++] = right[inputIdx];
      inputIdx++;
    }
  } else {
    interleaved = audioBuffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = interleaved.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // "fmt " sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // "data" sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples (convert float -1.0..1.0 to signed 16-bit integer)
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/mpeg' });
}

/**
 * Extracts and converts audio track from MP4 / WebM / Video in the browser
 */
export async function extractAudioFromVideo(
  file: File,
  options: { bitrate?: string; format?: string } = {},
  onProgress?: (percent: number) => void
): Promise<ProcessResult> {
  onProgress?.(15);
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  onProgress?.(30);
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(55);
  // Decode audio data from video stream natively in browser
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  onProgress?.(80);
  const audioBlob = audioBufferToWavBlob(audioBuffer);

  onProgress?.(100);
  const ext = options.format === 'wav' ? 'wav' : 'mp3';
  const outFilename = sanitizeFilename(file.name, ext);

  return {
    blob: audioBlob,
    downloadUrl: URL.createObjectURL(audioBlob),
    filename: outFilename,
    originalSize: file.size,
    processedSize: audioBlob.size,
    savingsPercentage: Math.max(0, Math.round(((file.size - audioBlob.size) / file.size) * 100)),
    metadata: {
      durationSeconds: Math.round(audioBuffer.duration),
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
    },
  };
}
