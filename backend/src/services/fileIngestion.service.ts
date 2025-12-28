import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import logger from '../config/logger';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB default

// Ensure upload directory exists
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(err => {
  logger.error('Failed to create upload directory:', err);
});

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['application/pdf', 'text/plain'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and text files are allowed.'));
    }
  },
});

export class FileIngestionService {
  /**
   * Save uploaded file and return file info
   */
  async saveFile(file: Express.Multer.File): Promise<{
    path: string;
    fileName: string;
    mimeType: string;
    size: number;
  }> {
    return {
      path: file.path,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  /**
   * Validate URL format
   */
  async validateUrl(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Clean up file after processing
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to delete file ${filePath}:`, error);
    }
  }
}

export default new FileIngestionService();
