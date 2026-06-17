# SleekScale - Premium Image Resizer

SleekScale is a high-performance, web-based image resizing and optimization application. Built with a sleek, responsive dark glassmorphic user interface on the frontend and powered by a robust Express.js & Sharp backend, SleekScale lets you resize, format, and compress images quickly and securely in your local environment.

## Features

- **Drag and Drop Interface**: Easily upload images (JPEG, PNG, WEBP) up to 10MB through an interactive dropzone.
- **Aspect Ratio Control**: Lock or unlock the aspect ratio. When locked, changing the width or height automatically recalculates the other dimension in real-time.
- **Multi-Format Conversion**: Convert your images to **JPEG**, **PNG**, or **WEBP** formats.
- **Custom Compression Quality**: Dynamically adjust output compression quality (1-100%) with a slider (disabled for lossless PNG format).
- **Glassmorphic UI**: Beautiful, modern dashboard styling utilizing CSS variables, glowing background orbs, smooth transitions, and Outfit / Plus Jakarta Sans fonts.
- **Compare Stats**: View file size and resolution comparison (Original vs Optimized) side-by-side upon processing completion.
- **Secure Processing**: Runs fully locally on your system using high-performance image processing pipelines via Sharp.

## Tech Stack

- **Backend**:
  - [Node.js](https://nodejs.org/) - Runtime environment
  - [Express](https://expressjs.com/) - Web framework
  - [Multer](https://github.com/expressjs/multer) - Middleware for handling `multipart/form-data` uploads
  - [Sharp](https://sharp.pixelplumbing.com/) - Ultra-fast Node.js image processing library
- **Frontend**:
  - [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML) - Semantic structure
  - [Vanilla CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) - Custom modern styles (Glassmorphism, CSS gradients, dynamic animations)
  - [Vanilla JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Front-end reactivity, real-time UI synchronization, and fetch requests

---

## File Structure

```text
image-resize/
├── index.js             # Express server entry point & Sharp pipeline config
├── package.json         # Node.js dependencies & scripts
├── readme.md            # Project documentation (this file)
└── public/              # Static frontend assets
    ├── index.html       # SleekScale Dashboard UI
    ├── css/
    │   └── style.css    # Premium CSS design & glassmorphism details
    └── js/
        └── app.js       # Form handling, drag & drop, client API logic
```

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone the repository or open the project directory in your terminal:
   ```bash
   cd image-resize
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the server using:
```bash
npm run dev
```

By default, the server runs at:
```
http://localhost:3000
```
Open this address in your browser to start using SleekScale.

---

## API Documentation

### `POST /api/resize`

Accepts multipart form-data to process an uploaded image.

#### Request Headers
- `Content-Type`: `multipart/form-data`

#### Request Body Parameters
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `image` | File | Yes | The image file to be resized (max 10MB). |
| `width` | Number | No | Target width in pixels. |
| `height` | Number | No | Target height in pixels. |
| `format` | String | No | Output format: `jpeg`, `png`, or `webp` (Default: `jpeg`). |
| `quality` | Number | No | Compression quality between `1` and `100` (Default: `80`). Only applies to WebP and JPEG. |
| `maintainAspectRatio` | String | No | `"true"` or `"false"` (Default: `"true"`). If false, image stretches to fit width/height. |

#### Response
- On success, returns the binary stream of the resized/optimized image with appropriate headers (`Content-Type` matching output format).
- On error, returns a JSON object (e.g., `{ "error": "Failed to process image." }`) with HTTP status 400 or 500.

---


