import React, { useState, useEffect } from 'react';
import { ToolDefinition, ProcessResult, ProcessingStatus } from '../types/tool';
import { ToolHeader } from '../components/tool/ToolHeader';
import { UploadArea } from '../components/tool/UploadArea';
import { FilePreview } from '../components/tool/FilePreview';
import { ProgressBar } from '../components/tool/ProgressBar';
import { ResultArea } from '../components/tool/ResultArea';
import { ToolContent } from '../components/tool/ToolContent';
import { ImageCompressorControls } from '../components/tool/controls/ImageCompressorControls';
import { ImageResizerControls } from '../components/tool/controls/ImageResizerControls';
import { FormatConverterControls } from '../components/tool/controls/FormatConverterControls';
import { PdfControls } from '../components/tool/controls/PdfControls';
import { Mp4ToMp3Controls } from '../components/tool/controls/Mp4ToMp3Controls';
import { HashToolWorkspace } from '../components/tool/controls/HashToolWorkspace';
import { Base64ToolWorkspace } from '../components/tool/controls/Base64ToolWorkspace';
import { CalculatorWorkspace } from '../components/tool/controls/CalculatorWorkspace';
import { CloudToolNotice } from '../components/tool/controls/CloudToolNotice';
import { AdBanner } from '../components/common/AdBanner';
import { updatePageMeta, generateToolStructuredData } from '../utils/seoHelpers';
import { toolService } from '../services/toolService';
import { analytics } from '../services/analytics';
import { ToastMessage } from '../components/common/Toast';

interface ToolDetailPageProps {
  tool: ToolDefinition;
  onNavigate: (path: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddRecentTool: (id: string) => void;
  onShowToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const ToolDetailPage: React.FC<ToolDetailPageProps> = ({
  tool,
  onNavigate,
  isFavorite,
  onToggleFavorite,
  onAddRecentTool,
  onShowToast,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessResult | null>(null);

  // Specific state for image tools
  const [compressQuality, setCompressQuality] = useState(80);
  const [compressFormat, setCompressFormat] = useState('original');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    // Record recently visited
    onAddRecentTool(tool.id);

    // Dynamic SEO
    const schema = generateToolStructuredData(tool);
    updatePageMeta({
      title: tool.seoTitle,
      description: tool.seoDescription,
      canonicalUrl: `https://toolvero.com${tool.route}`,
      keywords: tool.keywords,
      structuredData: schema,
    });

    analytics.trackPageView(tool.route, tool.name);

    // Reset workspace state on tool change
    handleReset();
  }, [tool.id]);

  // Load preview URL and image dimensions when file is selected
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatus('ready');

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(undefined);
    setStatus('idle');
    setProgress(0);
    setResult(null);
  };

  // Execution dispatch
  const executeProcessing = async (options: Record<string, any> = {}) => {
    if (!selectedFile) return;

    setStatus('processing');
    setProgress(10);

    try {
      const startTime = Date.now();
      const res = await toolService.processTool(
        tool,
        selectedFile,
        options,
        (p) => setProgress(p)
      );

      setResult(res);
      setStatus('success');
      onShowToast({
        type: 'success',
        message: `${tool.name}: Your file is ready for download!`,
      });

      analytics.trackEvent({
        name: 'tool_used',
        properties: {
          toolId: tool.id,
          toolName: tool.name,
          fileSize: selectedFile.size,
          durationMs: Date.now() - startTime,
          success: true,
        },
      });
    } catch (err: any) {
      setStatus('ready');
      onShowToast({
        type: 'error',
        message: err.message || 'Something went wrong while processing your file.',
      });
      analytics.trackEvent({
        name: 'tool_used',
        properties: {
          toolId: tool.id,
          toolName: tool.name,
          success: false,
        },
      });
    }
  };

  // Check if standalone utility tool (Hash, Base64, Calculator)
  const isHashTool = tool.id === 'hash-generator';
  const isBase64Tool = tool.id === 'base64-encoder-decoder';
  const isCalculatorTool = tool.id === 'file-size-calculator';
  const isStandaloneUtility = isHashTool || isBase64Tool || isCalculatorTool;

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tool Header */}
        <ToolHeader
          tool={tool}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onNavigate={onNavigate}
        />

        {/* Interactive Workspace */}
        <div className="space-y-6">
          {isHashTool && <HashToolWorkspace />}
          {isBase64Tool && <Base64ToolWorkspace />}
          {isCalculatorTool && <CalculatorWorkspace />}

          {!isStandaloneUtility && (
            <>
              {/* Upload Dropzone */}
              {status === 'idle' && (
                <UploadArea
                  supportedFormats={tool.supportedFormats}
                  maxFileSizeMB={tool.maxFileSizeMB}
                  onFileSelect={handleFileSelect}
                  onError={(msg) => onShowToast({ type: 'error', message: msg })}
                />
              )}

              {/* Ready State: File Details + Settings */}
              {status === 'ready' && selectedFile && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <FilePreview
                    file={selectedFile}
                    previewUrl={previewUrl}
                    onRemove={handleReset}
                  />

                  {/* Tool Controls */}
                  {tool.id === 'image-compressor' && (
                    <ImageCompressorControls
                      quality={compressQuality}
                      setQuality={setCompressQuality}
                      format={compressFormat}
                      setFormat={setCompressFormat}
                      onCompress={() =>
                        executeProcessing({ quality: compressQuality, format: compressFormat })
                      }
                      isProcessing={false}
                    />
                  )}

                  {tool.id === 'image-resizer' && (
                    <ImageResizerControls
                      originalWidth={imageDimensions.width}
                      originalHeight={imageDimensions.height}
                      onResize={(opts) => executeProcessing(opts)}
                      isProcessing={false}
                    />
                  )}

                  {(tool.id === 'jpg-to-png' || tool.id === 'png-to-jpg' || tool.id === 'webp-converter' || tool.id === 'image-cropper') && (
                    <FormatConverterControls
                      sourceType={selectedFile.type}
                      defaultTarget={
                        tool.id === 'jpg-to-png'
                          ? 'image/png'
                          : tool.id === 'png-to-jpg'
                          ? 'image/jpeg'
                          : 'image/webp'
                      }
                      onConvert={(opts) => executeProcessing(opts)}
                      isProcessing={false}
                    />
                  )}

                  {tool.id === 'jpg-to-pdf' && (
                    <PdfControls
                      onConvert={(opts) => executeProcessing(opts)}
                      isProcessing={false}
                    />
                  )}

                  {(tool.id === 'mp4-to-mp3' || tool.id === 'audio-extractor' || tool.id === 'wav-to-mp3' || tool.id === 'audio-converter') && (
                    <Mp4ToMp3Controls
                      onConvert={(opts) => executeProcessing(opts)}
                      isProcessing={false}
                    />
                  )}

                  {tool.engine === 'cloud-ready' && tool.id !== 'mp4-to-mp3' && tool.id !== 'audio-extractor' && tool.id !== 'wav-to-mp3' && tool.id !== 'audio-converter' && (
                    <CloudToolNotice tool={tool} file={selectedFile} />
                  )}
                </div>
              )}

              {/* Processing State */}
              {status === 'processing' && (
                <div className="space-y-6">
                  {selectedFile && (
                    <FilePreview
                      file={selectedFile}
                      previewUrl={previewUrl}
                      onRemove={handleReset}
                      disabled
                    />
                  )}
                  <ProgressBar progress={progress} label={`Processing with ${tool.name}...`} />
                </div>
              )}

              {/* Success Result State */}
              {status === 'success' && result && (
                <ResultArea result={result} onReset={handleReset} />
              )}
            </>
          )}
        </div>

        {/* In-Content Monetization Placement */}
        <div className="my-10">
          <AdBanner format="leaderboard" />
        </div>

        {/* SEO Content: What is it, How to use, FAQs */}
        <ToolContent tool={tool} />
      </div>
    </div>
  );
};
