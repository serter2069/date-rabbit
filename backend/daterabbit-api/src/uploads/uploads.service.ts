import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export type UploadType = 'id-photos' | 'selfies' | 'videos';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

@Injectable()
export class UploadsService {
  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs: UploadType[] = ['id-photos', 'selfies', 'videos'];
    for (const dir of dirs) {
      fs.mkdirSync(path.join(UPLOADS_ROOT, dir), { recursive: true });
    }
  }

  validateImageFile(file: Express.Multer.File): void {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: jpg, png, webp',
      );
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Image too large. Max size: 10MB');
    }
  }

  validateVideoFile(file: Express.Multer.File): void {
    if (!VIDEO_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: mp4, mov');
    }
    if (file.size > MAX_VIDEO_SIZE) {
      throw new BadRequestException('Video too large. Max size: 50MB');
    }
  }

  getFileUrl(uploadType: UploadType, filename: string): string {
    return `/uploads/${uploadType}/${filename}`;
  }

  deleteFile(filePath: string): void {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
