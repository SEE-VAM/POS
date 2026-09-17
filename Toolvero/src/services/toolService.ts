import { ProcessResult, ToolDefinition } from '../types/tool';
import { compressImage, resizeImage, convertImageFormat } from './imageProcessor';
import { convertImageToPdf } from './fileProcessor';
import { extractAudioFromVideo } from './audioProcessor';

export interface ExecutionOptions {
  [key: string]: any;
}

export class ToolService {
  /**
   * Unified dispatcher for processing tool requests
   */
  async processTool(
    tool: ToolDefinition,
    file: File,
    options: ExecutionOptions,
    onProgress: (percent: number) => void
  ): Promise<ProcessResult> {
    // 1. In-browser native tools
    switch (tool.id) {
      case 'image-compressor': {
        const quality = (options.quality ?? 80) / 100;
        const format = options.format === 'original' ? undefined : options.format;
        return await compressImage(file, { quality, format }, onProgress);
      }

      case 'image-resizer': {
        const width = Number(options.width) || 800;
        const height = Number(options.height) || 600;
        return await resizeImage(file, { width, height, format: options.format }, onProgress);
      }

      case 'jpg-to-png': {
        return await convertImageFormat(file, { targetFormat: 'image/png' }, onProgress);
      }

      case 'png-to-jpg': {
        const quality = (options.quality ?? 90) / 100;
        return await convertImageFormat(
          file,
          { targetFormat: 'image/jpeg', quality, backgroundColor: options.backgroundColor || '#ffffff' },
          onProgress
        );
      }

      case 'webp-converter': {
        const quality = (options.quality ?? 85) / 100;
        return await convertImageFormat(file, { targetFormat: 'image/webp', quality }, onProgress);
      }

      case 'jpg-to-pdf': {
        const orientation = options.orientation || 'auto';
        return await convertImageToPdf(file, orientation, onProgress);
      }

      case 'mp4-to-mp3':
      case 'audio-extractor':
      case 'wav-to-mp3':
      case 'audio-converter': {
        return await extractAudioFromVideo(file, options, onProgress);
      }

      default: {
        // Backend / Cloud-ready tools
        if (tool.engine === 'cloud-ready') {
          return await this.processCloudTool(tool, file, options, onProgress);
        }
        throw new Error(`Unsupported tool: ${tool.name}`);
      }
    }
  }

  /**
   * Cloud engine processing handler.
   * Connects to a FastAPI / Python backend or handles service endpoints.
   */
  private async processCloudTool(
    tool: ToolDefinition,
    file: File,
    options: ExecutionOptions,
    onProgress: (percent: number) => void
  ): Promise<ProcessResult> {
    const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;

    if (backendApiUrl) {
      // Real backend endpoint configured
      onProgress(10);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('toolId', tool.id);
      formData.append('options', JSON.stringify(options));

      const response = await fetch(`${backendApiUrl}/api/v1/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }

      onProgress(80);
      const blob = await response.blob();
      onProgress(100);

      return {
        blob,
        downloadUrl: URL.createObjectURL(blob),
        filename: `processed_${file.name}`,
        originalSize: file.size,
        processedSize: blob.size,
        savingsPercentage: 0,
      };
    } else {
      // Backend not yet configured in this deployment environment
      throw new Error(
        `Cloud processing engine for ${tool.name} requires a connected backend service. Set VITE_BACKEND_API_URL in your environment variables.`
      );
    }
  }
}

export const toolService = new ToolService();
