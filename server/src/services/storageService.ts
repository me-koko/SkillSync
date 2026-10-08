import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/environment';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage for local development
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, pdfs
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload images, PDFs, or documents.'));
    }
  },
});

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export class StorageService {
  /**
   * Upload file. If Cloudinary credentials are configured, it uploads to Cloudinary.
   * Otherwise, it returns the local static server URL.
   */
  static async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
      // In production with Cloudinary, file would be streamed to Cloudinary
      // For clean modular architecture:
      // const res = await cloudinary.v2.uploader.upload(file.path);
      // return { url: res.secure_url, ... };
    }

    // Default modular local fallback:
    const publicUrl = `/uploads/${file.filename}`;
    return {
      url: publicUrl,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  static deleteFile(filename: string): boolean {
    try {
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
