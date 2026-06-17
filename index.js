const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Set up memory storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit size to 10MB
  },
});

// Enable CORS for cross-origin local testing (file:// protocol)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// API Endpoint for resizing images
app.post("/api/resize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const {
      width,
      height,
      format = "jpeg",
      quality = 80,
      maintainAspectRatio = "true",
    } = req.body;

    const parsedWidth = width ? parseInt(width, 10) : null;
    const parsedHeight = height ? parseInt(height, 10) : null;
    const parsedQuality = parseInt(quality, 10) || 80;
    const keepRatio = maintainAspectRatio === "true";

    // Setup Sharp pipeline
    let pipeline = sharp(req.file.buffer);

    // Apply resizing if dimensions are provided
    if (parsedWidth || parsedHeight) {
      const resizeOptions = {};
      if (parsedWidth) resizeOptions.width = parsedWidth;
      if (parsedHeight) resizeOptions.height = parsedHeight;

      if (!keepRatio) {
        // Stretch the image if aspect ratio is not maintained
        resizeOptions.fit = "fill";
      } else {
        // Otherwise, fit inside the boundaries while preserving ratio
        resizeOptions.fit = "inside";
      }

      pipeline = pipeline.resize(resizeOptions);
    }

    // Format conversion and compression settings
    let contentType = "image/jpeg";
    if (format === "png") {
      pipeline = pipeline.toFormat("png");
      contentType = "image/png";
    } else if (format === "webp") {
      pipeline = pipeline.toFormat("webp", { quality: parsedQuality });
      contentType = "image/webp";
    } else {
      // Default to jpeg
      pipeline = pipeline.toFormat("jpeg", { quality: parsedQuality });
      contentType = "image/jpeg";
    }

    // Process image buffer
    const outputBuffer = await pipeline.toBuffer();

    // Send back response headers and binary data
    res.set({
      "Content-Type": contentType,
      "Content-Length": outputBuffer.length,
      "Cache-Control": "no-store",
    });

    return res.send(outputBuffer);
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ error: "Failed to process image." });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Image Resizer server running at http://localhost:${port}`);
});

