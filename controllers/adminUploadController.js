import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || Boolean(process.env.VERCEL);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!isVercel) {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {}
}

const storage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        try {
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          cb(null, uploadsDir);
        } catch (err) {
          cb(err, uploadsDir);
        }
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${baseName}_${Date.now()}${ext}`);
      }
    });

const fileFilter = (req, file, cb) => {
  const allowedExts = [
    // Icons & Logos
    '.svg', '.png', '.webp', '.jpg', '.jpeg',
    // Videos
    '.mp4', '.webm', '.ogg', '.mov'
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error(`File format ${ext} is not allowed. Only Icons (SVG, PNG, WebP) and Videos (MP4, WebM) are supported.`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for video, comfortably handles icons
  }
});

// Single upload handler returning clean URL
export const handleUpload = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file was uploaded'
      });
    }

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = file.mimetype.startsWith('video/') || ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);
    const isIcon = ext === '.svg' || file.mimetype.startsWith('image/') || ['.png', '.webp', '.jpg', '.jpeg'].includes(ext);

    let fileUrl = '';
    if (isVercel) {
      const base64 = file.buffer.toString('base64');
      fileUrl = `data:${file.mimetype};base64,${base64}`;
    } else {
      fileUrl = `/uploads/${file.filename}`;
    }

    return res.status(200).json({
      success: true,
      message: `${isVideo ? 'Video' : 'Icon'} uploaded successfully`,
      data: {
        url: fileUrl,
        filename: file.originalname,
        type: isVideo ? 'video' : 'icon',
        size: file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process file upload'
    });
  }
};
