import { ToolDefinition } from '../types/tool';

export const TOOLS: ToolDefinition[] = [
  // ================= IMAGE TOOLS =================
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    slug: 'image-compressor',
    category: 'image',
    route: '/tools/image-compressor',
    shortDescription: 'Reduce image file size while maintaining good quality.',
    description: 'Compress JPG, PNG, and WebP images online while maintaining high visual quality. 100% processed directly in your browser without uploading to any remote server.',
    icon: 'Minimize2',
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 30,
    engine: 'browser',
    isPopular: true,
    seoTitle: 'Image Compressor Online — Compress JPG, PNG & WebP | Toolvero',
    seoDescription: 'Compress JPG, PNG, and WebP images online with Toolvero. Reduce image size by up to 80% while preserving crisp quality right in your browser.',
    keywords: ['image compressor', 'compress jpg', 'compress png', 'compress webp', 'reduce image size', 'photo optimizer'],
    features: [
      'Adjustable quality slider from 10% to 100%',
      'Lossy and lossless optimization algorithms',
      'Format cross-conversion (Keep original or export to JPG, PNG, WebP)',
      '100% client-side privacy — images never touch a server',
      'Real-time before and after size calculation'
    ],
    howToSteps: [
      { step: 1, title: 'Upload your image', description: 'Drag and drop your JPG, PNG, or WebP photo into the upload box or browse from your device.' },
      { step: 2, title: 'Adjust compression quality', description: 'Choose your desired compression balance between 10% and 100% to hit your target file size.' },
      { step: 3, title: 'Select output format', description: 'Keep the original image extension or convert to WebP/JPG for even greater savings.' },
      { step: 4, title: 'Download your compressed image', description: 'Click Download to instantly save your optimized image with zero watermarks.' }
    ],
    faqs: [
      {
        question: 'Will compressing my image reduce its visible quality?',
        answer: 'Toolvero utilizes smart canvas compression algorithms that strip out invisible metadata and optimize color quantization. At 75%-85% quality, human eyes typically cannot distinguish any difference from the original photo.'
      },
      {
        question: 'Are my private photos uploaded to your servers?',
        answer: 'No! Toolvero processes your images 100% locally inside your browser using HTML5 Canvas. Your photos never leave your device, ensuring complete privacy and security.'
      },
      {
        question: 'What is the maximum file size supported?',
        answer: 'You can compress images up to 30 MB per file directly in your browser without any sign-up or subscription.'
      },
      {
        question: 'Can I convert to WebP while compressing?',
        answer: 'Yes, you can easily change the output format dropdown to WebP to unlock an extra 25-35% compression compared to standard JPEG.'
      }
    ]
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    slug: 'image-resizer',
    category: 'image',
    route: '/tools/image-resizer',
    shortDescription: 'Resize photos to exact pixel dimensions or percentage scaling.',
    description: 'Easily resize images by pixels or percentage while maintaining original aspect ratios. Ideal for social media headers, thumbnails, and website optimization.',
    icon: 'Maximize2',
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 30,
    engine: 'browser',
    isPopular: true,
    seoTitle: 'Image Resizer Online — Resize JPG & PNG by Pixels | Toolvero',
    seoDescription: 'Resize images online for free with Toolvero. Scale dimensions by exact pixels or percentage with aspect ratio lock directly in your browser.',
    keywords: ['image resizer', 'resize photo', 'scale image', 'change picture dimensions', 'social media photo resizer'],
    features: [
      'Scale by exact width and height pixels',
      'Percentage scaling (25%, 50%, 75%, 200%)',
      'One-click aspect ratio lock to prevent image distortion',
      'Smooth bicubic image resampling filter',
      'Export to JPG, PNG, or WebP'
    ],
    howToSteps: [
      { step: 1, title: 'Upload image', description: 'Select or drag your image into the workspace.' },
      { step: 2, title: 'Set dimensions', description: 'Enter your target width and height in pixels, or choose a scaling percentage.' },
      { step: 3, title: 'Toggle aspect ratio', description: 'Keep the aspect ratio lock enabled to prevent stretching or distortion.' },
      { step: 4, title: 'Download resized photo', description: 'Click Resize Image and download your newly scaled image file immediately.' }
    ],
    faqs: [
      {
        question: 'How do I prevent my photo from stretching?',
        answer: 'Keep the "Lock Aspect Ratio" link active. When active, modifying the width will automatically recalculate the proportional height.'
      },
      {
        question: 'Does enlarging an image make it blurry?',
        answer: 'Enlarging a low-resolution image beyond its native dimensions can introduce softness. However, scaling down produces ultra-crisp, sharp results.'
      },
      {
        question: 'Does this tool support PNG transparency?',
        answer: 'Yes! When you export as PNG or WebP, transparency channels are preserved perfectly.'
      }
    ]
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    slug: 'jpg-to-png',
    category: 'image',
    route: '/tools/jpg-to-png',
    shortDescription: 'Convert JPG images to lossless PNG format in seconds.',
    description: 'Convert standard JPG/JPEG images into high-definition PNG format with lossless compression and clean raster rendering.',
    icon: 'Repeat',
    supportedFormats: ['image/jpeg'],
    maxFileSizeMB: 30,
    engine: 'browser',
    isPopular: true,
    seoTitle: 'JPG to PNG Converter Online — Fast & Free | Toolvero',
    seoDescription: 'Convert JPG to PNG online with Toolvero. Fast, 100% free, browser-based conversion with zero data uploads and no file limits.',
    keywords: ['jpg to png', 'jpeg to png', 'convert jpg to png', 'image format converter'],
    features: [
      'Lossless 24-bit PNG conversion',
      'Batch-capable client-side architecture',
      'No quality degradation',
      'Safe local processing in your browser'
    ],
    howToSteps: [
      { step: 1, title: 'Choose JPG File', description: 'Select a JPG or JPEG photo from your computer or smartphone.' },
      { step: 2, title: 'Inspect Preview', description: 'Review file metadata, original dimensions, and color space.' },
      { step: 3, title: 'Convert to PNG', description: 'Click the Convert button to rasterize the file into PNG.' },
      { step: 4, title: 'Download PNG', description: 'Save your clean PNG file directly to your downloads folder.' }
    ],
    faqs: [
      {
        question: 'Why convert JPG to PNG?',
        answer: 'PNG is a lossless format, making it ideal for images that need repeated editing, graphics with crisp text, screenshots, and logos.'
      },
      {
        question: 'Does converting JPG to PNG automatically make transparent backgrounds?',
        answer: 'No. JPG files do not store alpha transparency channels. To create transparency, background cutout tools are needed.'
      }
    ]
  },
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG',
    slug: 'png-to-jpg',
    category: 'image',
    route: '/tools/png-to-jpg',
    shortDescription: 'Convert heavy PNG images to compact JPG format.',
    description: 'Transform transparent or heavy PNG graphics into lightweight JPG files. Perfect for decreasing website load times and email attachment sizes.',
    icon: 'RefreshCw',
    supportedFormats: ['image/png'],
    maxFileSizeMB: 30,
    engine: 'browser',
    isPopular: true,
    seoTitle: 'PNG to JPG Converter Online — Compact File Size | Toolvero',
    seoDescription: 'Convert PNG to JPG online for free. Compress transparent or solid PNGs into compact JPGs with custom background color fill.',
    keywords: ['png to jpg', 'png to jpeg', 'convert png to jpg', 'reduce png size'],
    features: [
      'Automatic white background fill for transparent pixels',
      'Adjustable JPG compression quality level',
      'Dramatic file size reduction (often 70%+ smaller)',
      'Instant browser-based processing'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PNG', description: 'Select your PNG file with or without transparency.' },
      { step: 2, title: 'Configure Quality', description: 'Select your preferred JPG output quality (default 90%).' },
      { step: 3, title: 'Convert', description: 'Process the image into a JPEG stream.' },
      { step: 4, title: 'Download', description: 'Save your optimized JPG.' }
    ],
    faqs: [
      {
        question: 'What happens to transparent backgrounds when converting to JPG?',
        answer: 'Because the JPG standard does not support transparency, transparent areas are automatically blended with a clean white matte.'
      },
      {
        question: 'How much smaller will the JPG be compared to PNG?',
        answer: 'For photographs and complex artwork, converting PNG to JPG often reduces the file size by 60% to 85%!'
      }
    ]
  },
  {
    id: 'webp-converter',
    name: 'WebP Converter',
    slug: 'webp-converter',
    category: 'image',
    route: '/tools/webp-converter',
    shortDescription: 'Convert any image to modern WebP format for fast web speed.',
    description: 'Transform PNG, JPG, or GIF into next-generation Google WebP format. Drastically improve your website PageSpeed and Core Web Vitals.',
    icon: 'Sparkles',
    supportedFormats: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileSizeMB: 30,
    engine: 'browser',
    isPopular: false,
    seoTitle: 'WebP Converter Online — Convert JPG & PNG to WebP | Toolvero',
    seoDescription: 'Convert JPG, PNG, and GIF images to WebP online for free. Boost SEO and site speed with next-gen image compression in your browser.',
    keywords: ['webp converter', 'convert to webp', 'jpg to webp', 'png to webp', 'next-gen image format'],
    features: [
      'Next-generation WebP encoder',
      'Preserves alpha transparency',
      'Up to 35% smaller than comparable JPEG',
      'Browser native conversion'
    ],
    howToSteps: [
      { step: 1, title: 'Upload your image', description: 'Drop your JPG or PNG image into the box.' },
      { step: 2, title: 'Select quality', description: 'Choose between 10% and 100% WebP quality.' },
      { step: 3, title: 'Generate WebP', description: 'Render the WebP blob in real-time.' },
      { step: 4, title: 'Download', description: 'Download your modern WebP image.' }
    ],
    faqs: [
      {
        question: 'Do all modern browsers support WebP?',
        answer: 'Yes! Chrome, Firefox, Safari, Edge, and mobile browsers on iOS and Android have full 100% native support for WebP.'
      }
    ]
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    slug: 'image-cropper',
    category: 'image',
    route: '/tools/image-cropper',
    shortDescription: 'Crop photos to custom dimensions or social aspect ratios.',
    description: 'Crop images to standard aspect ratios (1:1 Square, 16:9 Landscape, 9:16 Story/Reel, 4:3) or freely defined dimensions directly in your browser.',
    icon: 'Crop',
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 30,
    engine: 'browser',
    isPopular: false,
    seoTitle: 'Image Cropper Online — Crop Photos with Aspect Ratios | Toolvero',
    seoDescription: 'Crop JPG, PNG, and WebP images online for free. Use preset social media aspect ratios or custom pixel bounding boxes.',
    keywords: ['image cropper', 'crop photo', 'square image', '16:9 crop', 'avatar crop'],
    features: [
      'Social media presets (Instagram Square 1:1, Story 9:16, YouTube 16:9)',
      'Custom pixel coordinate selection',
      'Live visual crop frame preview',
      'Preserves original color profile'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select an image from your library.' },
      { step: 2, title: 'Select Aspect Ratio', description: 'Pick a preset ratio or define custom coordinates.' },
      { step: 3, title: 'Crop & Export', description: 'Render the cropped selection and download.' }
    ],
    faqs: [
      {
        question: 'Can I crop avatars for Instagram or Discord?',
        answer: 'Yes, select the 1:1 Square preset to export perfectly centered avatars.'
      }
    ]
  },

  // ================= VIDEO TOOLS =================
  {
    id: 'video-compressor',
    name: 'Video Compressor',
    slug: 'video-compressor',
    category: 'video',
    route: '/tools/video-compressor',
    shortDescription: 'Compress MP4 and WebM videos without ruining quality.',
    description: 'Reduce video file sizes to make them easy to email, message on Discord or WhatsApp, and upload to social channels. Cloud-processing architecture ready for high-efficiency H.264/H.265 transcode.',
    icon: 'Film',
    supportedFormats: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxFileSizeMB: 250,
    engine: 'cloud-ready',
    engineNotice: 'Cloud Video Processing Engine Ready — Connects to Toolvero FastAPI Video Pipeline.',
    isPopular: true,
    seoTitle: 'Video Compressor Online — Compress MP4 & MOV Videos | Toolvero',
    seoDescription: 'Compress large video files online with Toolvero. Reduce MP4 and MOV video sizes for Discord, WhatsApp, and email attachments.',
    keywords: ['video compressor', 'compress mp4', 'compress mov', 'reduce video size', 'video shrinker'],
    features: [
      'Target file size preset (Discord 8MB, WhatsApp 16MB, Email 25MB)',
      'Constant Rate Factor (CRF) video quality tuning',
      'Resolution downscaling (1080p, 720p, 480p)',
      'Audio bitrate adjustment'
    ],
    howToSteps: [
      { step: 1, title: 'Upload video', description: 'Drag and drop your MP4, MOV, or WebM video file.' },
      { step: 2, title: 'Choose compression mode', description: 'Select a target size preset or custom CRF slider.' },
      { step: 3, title: 'Process Video', description: 'Submit job to the processing engine.' },
      { step: 4, title: 'Download Video', description: 'Download your lightweight, high-compatibility MP4.' }
    ],
    faqs: [
      {
        question: 'What video formats are accepted?',
        answer: 'We accept MP4, WebM, MOV, and MKV files up to 250 MB.'
      },
      {
        question: 'Will audio remain in sync after compression?',
        answer: 'Yes, the transcode pipeline retains timestamps and syncs audio tracks with frame-accurate precision.'
      }
    ]
  },
  {
    id: 'video-to-gif',
    name: 'Video to GIF',
    slug: 'video-to-gif',
    category: 'video',
    route: '/tools/video-to-gif',
    shortDescription: 'Convert short video clips into smooth animated GIFs.',
    description: 'Transform MP4 and WebM videos into animated GIFs. Set frame rate, loop count, and output resolution for discord reactions and documentation.',
    icon: 'PlaySquare',
    supportedFormats: ['video/mp4', 'video/webm'],
    maxFileSizeMB: 100,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'Video to GIF Converter Online — High Quality Animated GIFs | Toolvero',
    seoDescription: 'Convert MP4 and WebM videos to animated GIFs online. Adjust frame rate, speed, and size with Toolvero.',
    keywords: ['video to gif', 'mp4 to gif', 'gif maker', 'animated gif converter'],
    features: [
      'FPS settings (10, 15, 24 fps)',
      'Palette generation for smooth color gradients',
      'Start and end timestamp trimming'
    ],
    howToSteps: [
      { step: 1, title: 'Upload video clip', description: 'Select a video under 60 seconds.' },
      { step: 2, title: 'Configure GIF', description: 'Choose frame rate and resolution.' },
      { step: 3, title: 'Export GIF', description: 'Generate palette and download your GIF.' }
    ],
    faqs: [
      {
        question: 'Why are GIFs larger than MP4 videos?',
        answer: 'GIF is an older uncompressed frame-by-frame format. For smaller sizes, choose 15 fps and 480p width.'
      }
    ]
  },
  {
    id: 'video-resizer',
    name: 'Video Resizer',
    slug: 'video-resizer',
    category: 'video',
    route: '/tools/video-resizer',
    shortDescription: 'Change video resolution and crop for social media.',
    description: 'Resize video dimensions for Instagram Stories, TikTok, YouTube Shorts, or standard 16:9 widescreen format.',
    icon: 'Tv',
    supportedFormats: ['video/mp4', 'video/webm'],
    maxFileSizeMB: 200,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'Video Resizer Online — Scale Video Resolution | Toolvero',
    seoDescription: 'Resize video resolution online for TikTok, Instagram Reels, and YouTube Shorts with Toolvero.',
    keywords: ['video resizer', 'scale video', 'resize mp4', '9:16 video converter'],
    features: ['Preset aspect ratios', 'Smart cropping or letterboxing', 'Clean resolution downscaling'],
    howToSteps: [
      { step: 1, title: 'Select video', description: 'Upload your video file.' },
      { step: 2, title: 'Choose target platform', description: 'Pick TikTok (9:16), YouTube (16:9), or Square (1:1).' },
      { step: 3, title: 'Download resized clip', description: 'Export and download the processed video.' }
    ],
    faqs: [
      { question: 'Can I add black padding instead of cropping?', answer: 'Yes, you can choose between center crop and letterbox padding.' }
    ]
  },
  {
    id: 'video-converter',
    name: 'Video Converter',
    slug: 'video-converter',
    category: 'video',
    route: '/tools/video-converter',
    shortDescription: 'Convert between MP4, WebM, MOV, and MKV.',
    description: 'Easily convert videos from Apple QuickTime MOV, WebM, or MKV to universal MP4 format with maximum device compatibility.',
    icon: 'FileVideo',
    supportedFormats: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'],
    maxFileSizeMB: 300,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'Video Converter Online — Convert MOV, WebM to MP4 | Toolvero',
    seoDescription: 'Universal video converter. Convert MOV, MKV, and WebM to MP4 online with Toolvero.',
    keywords: ['video converter', 'mov to mp4', 'mkv to mp4', 'webm to mp4'],
    features: ['Universal device compatibility', 'Subtitles and audio track pass-through', 'Hardware-accelerated encoding'],
    howToSteps: [
      { step: 1, title: 'Upload file', description: 'Select any video file.' },
      { step: 2, title: 'Select target format', description: 'Choose MP4, WebM, or MOV.' },
      { step: 3, title: 'Convert & save', description: 'Download the converted video.' }
    ],
    faqs: [
      { question: 'Which format is best for iPhone and Android?', answer: 'MP4 with H.264 video and AAC audio plays natively on virtually every phone, TV, and browser.' }
    ]
  },
  {
    id: 'audio-extractor',
    name: 'Audio Extractor',
    slug: 'audio-extractor',
    category: 'video',
    route: '/tools/audio-extractor',
    shortDescription: 'Extract audio tracks and music from video files.',
    description: 'Pull sound, speech, voiceovers, and background music out of videos and save them as pristine MP3 or WAV audio tracks.',
    icon: 'Headphones',
    supportedFormats: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxFileSizeMB: 200,
    engine: 'browser',
    isPopular: false,
    seoTitle: 'Audio Extractor Online — Extract Sound from Video | Toolvero',
    seoDescription: 'Extract audio from MP4, MOV, and WebM videos into MP3 or WAV audio files online with Toolvero.',
    keywords: ['audio extractor', 'extract audio from video', 'video sound ripper', 'mp4 audio rip'],
    features: ['Direct audio stream copy with zero quality loss', 'Export to MP3, WAV, or AAC', 'Fast extraction'],
    howToSteps: [
      { step: 1, title: 'Upload video', description: 'Provide the video with the audio track you want.' },
      { step: 2, title: 'Select audio format', description: 'Pick MP3 (320kbps) or uncompressed WAV.' },
      { step: 3, title: 'Download audio', description: 'Save your extracted audio track.' }
    ],
    faqs: [
      { question: 'Can I extract audio from 4K videos?', answer: 'Yes! Only the audio stream is parsed, making the process fast even on large video files.' }
    ]
  },

  // ================= AUDIO TOOLS =================
  {
    id: 'mp4-to-mp3',
    name: 'MP4 to MP3',
    slug: 'mp4-to-mp3',
    category: 'audio',
    route: '/tools/mp4-to-mp3',
    shortDescription: 'Convert MP4 videos into high-quality MP3 audio files.',
    description: 'Convert MP4 video clips, lectures, podcasts, and recordings into standalone MP3 audio files with custom bitrate selection up to 320 kbps.',
    icon: 'Music',
    supportedFormats: ['video/mp4', 'video/x-m4v'],
    maxFileSizeMB: 150,
    engine: 'browser',
    isPopular: true,
    seoTitle: 'MP4 to MP3 Converter Online — High Bitrate 320kbps | Toolvero',
    seoDescription: 'Convert MP4 videos to MP3 audio online for free with Toolvero. Choose 128k, 192k, or 320k bitrates with crystal clear sound quality.',
    keywords: ['mp4 to mp3', 'convert mp4 to mp3', 'video to audio converter', 'mp3 extractor'],
    features: ['Bitrate selection (128kbps, 192kbps, 256kbps, 320kbps)', 'ID3 tag preservation', 'Fast audio transcode'],
    howToSteps: [
      { step: 1, title: 'Upload MP4', description: 'Choose your MP4 video file.' },
      { step: 2, title: 'Select audio quality', description: 'Select 320 kbps for studio quality, or 128 kbps for compact podcast files.' },
      { step: 3, title: 'Convert to MP3', description: 'Start audio extraction.' },
      { step: 4, title: 'Download MP3', description: 'Save your audio file to your music library.' }
    ],
    faqs: [
      { question: 'What bitrate should I choose?', answer: 'For music and songs, 320 kbps provides the highest fidelity. For speech and audiobooks, 128 kbps is sufficient and produces smaller files.' }
    ]
  },
  {
    id: 'audio-converter',
    name: 'Audio Converter',
    slug: 'audio-converter',
    category: 'audio',
    route: '/tools/audio-converter',
    shortDescription: 'Convert audio files between MP3, WAV, AAC, and FLAC.',
    description: 'Versatile audio converter supporting all popular audio codecs. Convert lossless FLAC to MP3, or switch between M4A, OGG, and WAV.',
    icon: 'Radio',
    supportedFormats: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg'],
    maxFileSizeMB: 100,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'Audio Converter Online — Convert MP3, WAV, FLAC, AAC | Toolvero',
    seoDescription: 'Convert between all major audio formats online for free with Toolvero. Fast, clean audio conversion.',
    keywords: ['audio converter', 'convert audio', 'flac to mp3', 'm4a to mp3', 'audio format converter'],
    features: ['Supports MP3, WAV, FLAC, AAC, OGG', 'Audio sample rate customization (44.1kHz / 48kHz)', 'Stereo and Mono channel modes'],
    howToSteps: [
      { step: 1, title: 'Upload audio file', description: 'Choose your source audio track.' },
      { step: 2, title: 'Choose target codec', description: 'Select the desired audio format.' },
      { step: 3, title: 'Download', description: 'Download your converted sound track.' }
    ],
    faqs: [
      { question: 'Can I convert lossless FLAC to MP3?', answer: 'Yes! You can choose 320kbps MP3 to retain almost all audible frequency detail while shrinking the file size by 75%.' }
    ]
  },
  {
    id: 'audio-compressor',
    name: 'Audio Compressor',
    slug: 'audio-compressor',
    category: 'audio',
    route: '/tools/audio-compressor',
    shortDescription: 'Reduce audio file sizes for email and web streaming.',
    description: 'Compress large voice recordings, voice notes, and podcast episodes to send over email or speed up web page streaming.',
    icon: 'Sliders',
    supportedFormats: ['audio/mpeg', 'audio/wav', 'audio/aac'],
    maxFileSizeMB: 100,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'Audio Compressor Online — Reduce MP3 & WAV Size | Toolvero',
    seoDescription: 'Compress MP3, WAV, and audio files online. Shrink audio attachments for email and chat with Toolvero.',
    keywords: ['audio compressor', 'compress mp3', 'reduce audio file size', 'shrink voice recording'],
    features: ['Smart variable bitrate (VBR) compression', 'High-pass voice filter option', 'Size reduction estimator'],
    howToSteps: [
      { step: 1, title: 'Upload audio', description: 'Upload your MP3 or audio recording.' },
      { step: 2, title: 'Set compression level', description: 'Choose low, medium, or aggressive compression.' },
      { step: 3, title: 'Download compressed audio', description: 'Save your compact audio file.' }
    ],
    faqs: [
      { question: 'Can I compress voice notes without making voices sound metallic?', answer: 'Yes, Toolvero uses modern psychoacoustic models that prioritize human vocal frequencies.' }
    ]
  },
  {
    id: 'wav-to-mp3',
    name: 'WAV to MP3',
    slug: 'wav-to-mp3',
    category: 'audio',
    route: '/tools/wav-to-mp3',
    shortDescription: 'Convert uncompressed WAV audio into compact MP3s.',
    description: 'Turn huge uncompressed studio WAV files into lightweight MP3 tracks that take up 90% less disk space.',
    icon: 'FileAudio',
    supportedFormats: ['audio/wav', 'audio/x-wav'],
    maxFileSizeMB: 150,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'WAV to MP3 Converter Online — Free & Fast | Toolvero',
    seoDescription: 'Convert WAV to MP3 online. Shrink uncompressed audio files by 90% while keeping high fidelity sound with Toolvero.',
    keywords: ['wav to mp3', 'convert wav to mp3', 'compress wav file'],
    features: ['Up to 90% size reduction', 'Full frequency response', 'Batch conversion ready'],
    howToSteps: [
      { step: 1, title: 'Upload WAV', description: 'Select your WAV audio file.' },
      { step: 2, title: 'Select Bitrate', description: 'Select 192kbps or 320kbps.' },
      { step: 3, title: 'Download MP3', description: 'Save your lightweight MP3.' }
    ],
    faqs: [
      { question: 'Why is my WAV file so huge?', answer: 'WAV files store raw pulse-code modulation (PCM) audio without any compression. MP3 reduces this dramatically without noticeable loss in everyday listening.' }
    ]
  },
  {
    id: 'mp3-to-wav',
    name: 'MP3 to WAV',
    slug: 'mp3-to-wav',
    category: 'audio',
    route: '/tools/mp3-to-wav',
    shortDescription: 'Convert MP3 audio to uncompressed WAV format.',
    description: 'Decompress MP3 audio into standard PCM 16-bit or 24-bit WAV format for compatibility with digital audio workstations (DAWs) and audio editors.',
    icon: 'Disc',
    supportedFormats: ['audio/mpeg'],
    maxFileSizeMB: 100,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'MP3 to WAV Converter Online — Uncompressed Audio | Toolvero',
    seoDescription: 'Convert MP3 to WAV format online with Toolvero. Prepare audio tracks for DAWs, CD burning, and editing software.',
    keywords: ['mp3 to wav', 'convert mp3 to wav', 'decompress audio'],
    features: ['16-bit and 24-bit PCM options', '44.1 kHz and 48 kHz standard sample rates', 'DAW compatible'],
    howToSteps: [
      { step: 1, title: 'Upload MP3', description: 'Select your MP3 file.' },
      { step: 2, title: 'Configure WAV Bit Depth', description: 'Choose 16-bit (CD) or 24-bit (Studio).' },
      { step: 3, title: 'Download WAV', description: 'Export your uncompressed WAV file.' }
    ],
    faqs: [
      { question: 'Does converting MP3 to WAV restore lost audio quality?', answer: 'No lossy compression can be reversed, but converting to WAV ensures compatibility with audio software that requires uncompressed input.' }
    ]
  },

  // ================= PDF TOOLS =================
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    slug: 'pdf-compressor',
    category: 'pdf',
    route: '/tools/pdf-compressor',
    shortDescription: 'Reduce PDF file size while keeping text and graphics readable.',
    description: 'Compress heavy PDF documents, contracts, scan reports, and eBooks to easily attach them to emails and government portal submissions.',
    icon: 'FileCheck',
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    engine: 'cloud-ready',
    isPopular: true,
    seoTitle: 'PDF Compressor Online — Reduce PDF File Size | Toolvero',
    seoDescription: 'Compress PDF files online for free with Toolvero. Reduce PDF file size for email attachments and online forms without losing readability.',
    keywords: ['pdf compressor', 'compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf optimizer'],
    features: [
      'Preset compression levels (Extreme, Recommended, High Quality)',
      'Image DPI downsampling',
      'Removal of duplicate font descriptors and metadata',
      'Clean text and vector retention'
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Drag and drop your PDF document.' },
      { step: 2, title: 'Select compression mode', description: 'Choose between Maximum compression (smallest size) or High quality.' },
      { step: 3, title: 'Compress PDF', description: 'Execute the optimization algorithm.' },
      { step: 4, title: 'Download Document', description: 'Download your compact, email-ready PDF.' }
    ],
    faqs: [
      { question: 'Will text inside the PDF stay clear and searchable?', answer: 'Yes! Vector text and fonts are preserved intact; the compression focuses on downsampling embedded images and unneeded structural objects.' },
      { question: 'Can I compress password-protected PDFs?', answer: 'You must first remove the password before uploading for compression.' }
    ]
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    slug: 'jpg-to-pdf',
    category: 'pdf',
    route: '/tools/jpg-to-pdf',
    shortDescription: 'Convert photos and scans into a clean PDF document.',
    description: 'Combine single or multiple JPG and PNG images into a clean, multi-page PDF document. 100% processed in your browser using jsPDF.',
    icon: 'FileSpreadsheet',
    supportedFormats: ['image/jpeg', 'image/png'],
    maxFileSizeMB: 30,
    engine: 'browser',
    isPopular: true,
    seoTitle: 'JPG to PDF Converter Online — Fast & In-Browser | Toolvero',
    seoDescription: 'Convert JPG images to PDF document online with Toolvero. 100% private in-browser conversion with zero server uploads.',
    keywords: ['jpg to pdf', 'convert jpg to pdf', 'images to pdf', 'photo to pdf', 'picture to pdf'],
    features: [
      'Generates standard ISO-compliant PDF',
      'Automatic page orientation detection (Portrait/Landscape)',
      '100% in-browser processing with zero server transmission',
      'High-resolution output'
    ],
    howToSteps: [
      { step: 1, title: 'Upload image', description: 'Select your JPG or PNG image.' },
      { step: 2, title: 'Choose Page Orientation', description: 'Select Auto, Portrait, or Landscape.' },
      { step: 3, title: 'Generate PDF', description: 'Package the image into a clean PDF.' },
      { step: 4, title: 'Download PDF', description: 'Save your PDF document immediately.' }
    ],
    faqs: [
      { question: 'Is my document private?', answer: 'Yes! The PDF is assembled 100% locally in your web browser via JavaScript. Not a single pixel is uploaded to any server.' }
    ]
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    slug: 'pdf-to-jpg',
    category: 'pdf',
    route: '/tools/pdf-to-jpg',
    shortDescription: 'Extract PDF pages as high-resolution JPG images.',
    description: 'Convert each page of a PDF document into crisp JPG image files. Perfect for embedding slides into presentations or posting documents online.',
    icon: 'FileImage',
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 80,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'PDF to JPG Converter Online — Extract PDF Pages | Toolvero',
    seoDescription: 'Convert PDF pages into high-resolution JPG images online with Toolvero. Clean, fast, and high DPI extraction.',
    keywords: ['pdf to jpg', 'convert pdf to image', 'extract pdf pages', 'pdf to picture'],
    features: ['High DPI rasterization (150 DPI / 300 DPI)', 'Export individual pages or ZIP bundle', 'Sharp font rendering'],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Select your PDF document.' },
      { step: 2, title: 'Select DPI Quality', description: 'Choose standard or high-resolution extraction.' },
      { step: 3, title: 'Download JPGs', description: 'Download pages as individual images or a ZIP archive.' }
    ],
    faqs: [
      { question: 'What resolution are the extracted JPGs?', answer: 'Standard is 150 DPI (great for web and screens) and High is 300 DPI (suitable for printing).' }
    ]
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    slug: 'merge-pdf',
    category: 'pdf',
    route: '/tools/merge-pdf',
    shortDescription: 'Combine multiple PDF documents into a single unified file.',
    description: 'Merge separate PDF reports, invoices, chapters, or receipts into one single well-ordered PDF document.',
    icon: 'Layers',
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'Merge PDF Online — Combine Multiple PDFs into One | Toolvero',
    seoDescription: 'Combine multiple PDF files into one document online for free with Toolvero. Easy drag-and-drop reordering.',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger'],
    features: ['Drag-and-drop file reordering', 'Preserves bookmarks and internal links', 'Fast document stitching'],
    howToSteps: [
      { step: 1, title: 'Upload PDFs', description: 'Select two or more PDF files.' },
      { step: 2, title: 'Reorder pages', description: 'Arrange files in the exact order you want them merged.' },
      { step: 3, title: 'Download Combined PDF', description: 'Save your merged document.' }
    ],
    faqs: [
      { question: 'Is there a limit on how many PDFs I can merge?', answer: 'You can merge up to 20 PDF files simultaneously.' }
    ]
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    slug: 'split-pdf',
    category: 'pdf',
    route: '/tools/split-pdf',
    shortDescription: 'Extract specific pages or page ranges from a PDF.',
    description: 'Split a large PDF document into separate single-page files or extract a custom range of pages (e.g. pages 3–7) into a new document.',
    icon: 'Scissors',
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'Split PDF Online — Extract Pages from PDF | Toolvero',
    seoDescription: 'Split PDF files and extract individual pages or custom page ranges online with Toolvero.',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf', 'cut pdf'],
    features: ['Custom page range extraction (e.g., 1-5, 8, 11-14)', 'Split every single page into separate files', 'Visual thumbnail page selector'],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Upload the PDF document you want to split.' },
      { step: 2, title: 'Specify Page Range', description: 'Enter the page numbers you wish to extract.' },
      { step: 3, title: 'Download Split PDF', description: 'Save your new targeted PDF file.' }
    ],
    faqs: [
      { question: 'Can I extract non-consecutive pages?', answer: 'Yes, you can enter comma-separated ranges like "1-3, 5, 8-10".' }
    ]
  },

  // ================= FILE TOOLS =================
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    slug: 'hash-generator',
    category: 'file',
    route: '/tools/hash-generator',
    shortDescription: 'Generate SHA-256, SHA-512, and MD5 cryptographic hashes.',
    description: 'Compute cryptographic checksums and hashes for any file or text string directly in your browser using the native Web Crypto API.',
    icon: 'ShieldCheck',
    supportedFormats: ['*/*'],
    maxFileSizeMB: 200,
    engine: 'browser',
    isPopular: false,
    seoTitle: 'Hash Generator Online — SHA-256, SHA-512, SHA-1 Checksums | Toolvero',
    seoDescription: 'Generate cryptographic hashes for files and text online with Toolvero. 100% in-browser calculation using the Web Crypto API.',
    keywords: ['hash generator', 'sha256 generator', 'sha512', 'md5 file checksum', 'file hash checker'],
    features: [
      'Supports SHA-256, SHA-512, SHA-384, and SHA-1',
      'Calculates directly from file stream or raw text',
      '100% client-side privacy using window.crypto.subtle',
      'One-click checksum copy to clipboard'
    ],
    howToSteps: [
      { step: 1, title: 'Select File or Enter Text', description: 'Choose any file from your computer or type input text.' },
      { step: 2, title: 'Select Hash Algorithm', description: 'Pick SHA-256 (recommended for security), SHA-512, or SHA-1.' },
      { step: 3, title: 'Copy Result', description: 'Click the copy icon to use the computed hexadecimal digest.' }
    ],
    faqs: [
      { question: 'Why should I verify a file hash?', answer: 'File hashes verify integrity. If a downloaded file matches the developer’s published SHA-256 hash, you know it was not corrupted or tampered with.' },
      { question: 'Can a hash be reversed into the original file?', answer: 'No. Cryptographic hash functions are one-way mathematical operations; it is computationally infeasible to recover the original content from a digest.' }
    ]
  },
  {
    id: 'base64-encoder-decoder',
    name: 'Base64 Encoder / Decoder',
    slug: 'base64-encoder-decoder',
    category: 'file',
    route: '/tools/base64-encoder-decoder',
    shortDescription: 'Encode files or text to Base64 and decode Base64 strings.',
    description: 'Encode images, documents, or raw text into standard RFC 4648 Base64 data URIs, or decode Base64 strings back to original binary files and text.',
    icon: 'Binary',
    supportedFormats: ['*/*'],
    maxFileSizeMB: 20,
    engine: 'browser',
    isPopular: false,
    seoTitle: 'Base64 Encoder & Decoder Online — Files & Text | Toolvero',
    seoDescription: 'Encode and decode Base64 strings and files online with Toolvero. Generates HTML/CSS data URIs in your browser.',
    keywords: ['base64 encoder', 'base64 decoder', 'image to base64', 'data uri generator', 'base64 convert'],
    features: [
      'Bidirectional encoding and decoding',
      'Generate CSS/HTML <img> data URIs',
      'Direct binary file download from decoded strings',
      'Zero server roundtrip'
    ],
    howToSteps: [
      { step: 1, title: 'Choose Mode', description: 'Select either Encode (File/Text -> Base64) or Decode (Base64 -> File/Text).' },
      { step: 2, title: 'Provide Input', description: 'Upload your file or paste your string.' },
      { step: 3, title: 'Copy or Download', description: 'Copy the resulting Base64 string or download the decoded file.' }
    ],
    faqs: [
      { question: 'What is Base64 used for?', answer: 'Base64 represents binary data in an ASCII string format, allowing files like icons to be embedded directly inside HTML, JSON, or CSS without extra HTTP requests.' }
    ]
  },
  {
    id: 'file-size-calculator',
    name: 'File Size Calculator',
    slug: 'file-size-calculator',
    category: 'file',
    route: '/tools/file-size-calculator',
    shortDescription: 'Convert between Bytes, KB, MB, GB, TB & transfer speeds.',
    description: 'Convert data units across binary (KiB, MiB, GiB) and decimal (KB, MB, GB) scales, and estimate exact download and upload times across 4G, 5G, Fiber, and DSL connections.',
    icon: 'Calculator',
    supportedFormats: ['*/*'],
    maxFileSizeMB: 1000,
    engine: 'browser',
    isPopular: false,
    seoTitle: 'File Size Calculator Online — Data Units & Transfer Speed | Toolvero',
    seoDescription: 'Convert between Bytes, KB, MB, GB, TB and calculate download times across internet connection speeds with Toolvero.',
    keywords: ['file size calculator', 'data unit converter', 'download time calculator', 'mb to gb', 'bandwidth speed test'],
    features: [
      'Converts between Bytes, Kilobytes, Megabytes, Gigabytes, and Terabytes',
      'Binary (1024) vs Decimal (1000) base toggle',
      'Estimated transfer times for Gigabit Fiber, 5G, 4G LTE, and broadband'
    ],
    howToSteps: [
      { step: 1, title: 'Enter File Size', description: 'Type an amount and select your starting unit (e.g. 500 MB).' },
      { step: 2, title: 'View Conversions', description: 'Instantly view equivalent values in Bytes, KB, GB, and TB.' },
      { step: 3, title: 'Check Transfer Times', description: 'See how long it will take to download over different networks.' }
    ],
    faqs: [
      { question: 'What is the difference between MB and MiB?', answer: 'Megabytes (MB) use base 10 (1 MB = 1,000,000 bytes) commonly used by storage manufacturers. Mebibytes (MiB) use base 2 (1 MiB = 1,048,576 bytes) used by Windows operating systems.' }
    ]
  },
  {
    id: 'zip-creator',
    name: 'ZIP Creator',
    slug: 'zip-creator',
    category: 'file',
    route: '/tools/zip-creator',
    shortDescription: 'Package multiple files into a single compressed ZIP archive.',
    description: 'Bundle documents, photos, and files into a standard ZIP archive to email them or keep files organized.',
    icon: 'Archive',
    supportedFormats: ['*/*'],
    maxFileSizeMB: 100,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'ZIP Creator Online — Compress Files into ZIP Archive | Toolvero',
    seoDescription: 'Package multiple files into a compressed ZIP file online with Toolvero. Free, simple, and clean.',
    keywords: ['zip creator', 'make zip online', 'create zip archive', 'compress files to zip'],
    features: ['Multi-file selection', 'Zero software installation', 'Standard Deflate compression'],
    howToSteps: [
      { step: 1, title: 'Select Files', description: 'Add all files you want bundled.' },
      { step: 2, title: 'Name ZIP', description: 'Specify the archive name.' },
      { step: 3, title: 'Download Archive', description: 'Download your packaged .zip file.' }
    ],
    faqs: [
      { question: 'Can I unzip this on any computer?', answer: 'Yes, .zip files open natively on Windows, macOS, Linux, iOS, and Android without any extra software.' }
    ]
  },
  {
    id: 'file-converter',
    name: 'File Converter',
    slug: 'file-converter',
    category: 'file',
    route: '/tools/file-converter',
    shortDescription: 'Convert documents and archives between common formats.',
    description: 'Universal file format converter supporting document interchange, e-books, spreadsheets, and archives.',
    icon: 'FileCode',
    supportedFormats: ['*/*'],
    maxFileSizeMB: 100,
    engine: 'cloud-ready',
    isPopular: false,
    seoTitle: 'File Converter Online — Universal Document & File Conversion | Toolvero',
    seoDescription: 'Convert files between document and media formats online with Toolvero.',
    keywords: ['file converter', 'universal converter', 'document converter', 'convert formats'],
    features: ['Multi-format auto-detection', 'Secure file handling', 'Cloud processing engine ready'],
    howToSteps: [
      { step: 1, title: 'Upload file', description: 'Choose your document or file.' },
      { step: 2, title: 'Select target format', description: 'Pick the desired target extension.' },
      { step: 3, title: 'Download converted file', description: 'Save your file.' }
    ],
    faqs: [
      { question: 'Is my data secure?', answer: 'Yes! Toolvero adheres to a strict privacy-first policy where files are never retained or indexed.' }
    ]
  }
];

export const POPULAR_TOOLS: ToolDefinition[] = TOOLS.filter(t => t.isPopular).slice(0, 8);
