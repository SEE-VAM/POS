# Toolvero — Powerful Online Tools. Simple & Fast.

> A modern, production-quality online utility platform for instant image, video, audio, PDF, and file operations. Built with React 18, TypeScript, Vite, and Tailwind CSS.

---

## 🌟 Overview

Toolvero is a high-performance, privacy-focused online utility suite designed for students, developers, content creators, and office users. By prioritizing client-side browser execution (via the HTML5 Canvas API and Web Crypto API), Toolvero ensures maximum privacy, near-instant speed, and zero server storage costs.

---

## 🚀 Key Features

- **100% In-Browser Privacy**: Image compression, resizing, format conversion (JPG/PNG/WebP), SHA-256 hash generation, Base64 conversion, and PDF packaging run directly on your device.
- **26+ Production Utilities**: Across 5 major categories: Image, Video, Audio, PDF, and File tools.
- **Global Search (`Ctrl + K` / `Cmd + K`)**: Instant search modal with fuzzy matching, keyboard navigation, and recent/favorite tool discovery.
- **Personalized Discovery**: Locally persisted **Favorites** and **Recently Visited** tools stored safely in `localStorage`.
- **Theme Support**: Seamless Dark Mode and Light Mode with system preference auto-detection.
- **Responsive Design**: Flawlessly tested across mobile (320px–414px), tablet (768px), desktop (1024px–1440px), and ultra-wide screens (1920px).
- **SEO & Social Optimization**: Dynamic page titles, meta tags, OpenGraph / Twitter cards, and Schema.org JSON-LD structured data (`SoftwareApplication`, `HowTo`, `FAQPage`).
- **Monetization & Analytics Ready**: Non-intrusive reserved ad banner placeholders (`Advertisement`) and pluggable Google Analytics 4 integration.
- **Extensible Architecture**: Clean service interfaces prepared for connecting a Python / FastAPI transcode backend.

---

## 🛠️ Tech Stack

- **Framework**: React 18 (TypeScript)
- **Bundler**: Vite 5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Confetti**: Canvas Confetti

---

## 💻 Getting Started

### 1. Prerequisites

- **Node.js**: Version 18.0.0 or later (LTS recommended)
- **npm**: Version 9.0.0 or later

### 2. Installing Dependencies

Clone the repository and install packages:

```bash
npm install
```

### 3. Running Locally in Development

Start the local Vite development server:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### 4. Building for Production

Compile TypeScript and build the optimized production assets:

```bash
npm run build
```

The output bundle will be generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## 🌐 Deploying to GitHub Pages

To host Toolvero for free on GitHub Pages:

1. In `vite.config.ts`, set the base path if using a subfolder repository:
   ```ts
   export default defineConfig({
     base: '/Toolvero/', // or '/' if deploying to a custom root domain
     plugins: [react()],
   });
   ```

2. Add the `gh-pages` deployment script in `package.json`:
   ```bash
   npm install --save-dev gh-pages
   ```
   Add to `scripts`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. Deploy with a single command:
   ```bash
   npm run deploy
   ```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_SITE_URL` | Canonical root URL of your deployment | `https://toolvero.com` |
| `VITE_GA_MEASUREMENT_ID` | Optional Google Analytics 4 Measurement ID | `G-ABC123XYZ` |
| `VITE_BACKEND_API_URL` | Endpoint for the Python / FastAPI video & transcode backend | `https://api.toolvero.com` |

---

## 🔌 Connecting the Future FastAPI / Python Backend

Toolvero is architected with a unified service layer (`src/services/toolService.ts`). 

### Standard Backend Request Contract

When `VITE_BACKEND_API_URL` is set, heavy operations (such as multi-GB video transcode, audio compression, or OCR) send a standard `multipart/form-data` request:

```
POST /api/v1/process
```

**Payload:**
- `file`: The binary file upload
- `toolId`: Unique tool identifier (e.g. `video-compressor`, `mp4-to-mp3`)
- `options`: JSON-serialized configuration parameters (e.g. `{ "preset": "balanced", "bitrate": "192k" }`)

### Sample FastAPI Backend Handler (`main.py`):

```python
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import json

app = FastAPI(title="Toolvero Cloud Processing Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://toolvero.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/process")
async def process_media(
    file: UploadFile = File(...),
    toolId: str = Form(...),
    options: str = Form(...)
):
    opts = json.loads(options)
    content = await file.read()
    
    # Process with FFmpeg, Ghostscript, or PyPDF here...
    # Return processed binary output
    return Response(
        content=content,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename=processed_{file.filename}"}
    )
```

---

## ➕ How to Add a New Tool

Thanks to the centralized tool registry, adding a new utility takes under 5 minutes without touching route boilerplate:

1. Open `src/data/tools.ts`.
2. Add your new tool configuration:
   ```ts
   {
     id: 'svg-optimizer',
     name: 'SVG Optimizer',
     slug: 'svg-optimizer',
     category: 'image',
     route: '/tools/svg-optimizer',
     shortDescription: 'Minify SVG vector graphics and clean up code.',
     description: 'Strip unnecessary metadata and clean SVG XML code in your browser.',
     icon: 'FileCode',
     supportedFormats: ['image/svg+xml'],
     maxFileSizeMB: 10,
     engine: 'browser',
     isPopular: false,
     seoTitle: 'SVG Optimizer Online — Clean & Minify Vectors | Toolvero',
     seoDescription: 'Minify SVG vectors online with Toolvero. 100% in-browser.',
     keywords: ['svg optimizer', 'clean svg', 'minify vector'],
     features: ['Removes XML namespaces', 'Strips editor metadata'],
     howToSteps: [
       { step: 1, title: 'Upload SVG', description: 'Select your SVG file.' },
       { step: 2, title: 'Optimize', description: 'Strip unneeded metadata.' },
       { step: 3, title: 'Download', description: 'Download clean vector.' }
     ],
     faqs: [
       { question: 'Will this affect SVG display?', answer: 'No, visual paths are preserved.' }
     ]
   }
   ```
3. If it runs in the browser, add the processing logic in `src/services/toolService.ts` and UI controls in `src/pages/ToolDetailPage.tsx`.
4. The tool is automatically indexed in the global search (`Ctrl+K`), catalog, category pages, and sitemap.

---

## 🛡️ License

© 2026 Toolvero. All rights reserved.
