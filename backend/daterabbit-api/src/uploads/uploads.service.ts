import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as path from 'path';

export type UploadType = 'id-photos' | 'selfies' | 'videos' | 'profile-photos' | 'date-photos';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

@Injectable()
export class UploadsService {
  private s3: S3Client;
  private bucket: string;
  private endpoint: string;

  constructor(private configService: ConfigService) {
    this.endpoint = this.configService.get<string>('HETZNER_S3_ENDPOINT', '');
    this.bucket = this.configService.get<string>('HETZNER_S3_BUCKET', '');
    const accessKey = this.configService.get<string>('HETZNER_S3_ACCESS_KEY', '');
    const secretKey = this.configService.get<string>('HETZNER_S3_SECRET_KEY', '');

    this.s3 = new S3Client({
      endpoint: this.endpoint,
      region: 'us-east-1', // MinIO requires a region value; actual region is irrelevant
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    });
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

  async uploadFile(file: Express.Multer.File, uploadType: UploadType): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const key = `${uploadType}/${crypto.randomUUID()}${ext}`;

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    }));

    // Return public URL: endpoint/bucket/key
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract S3 key from full URL: https://s3.host/bucket/type/filename
      // or legacy local path: /uploads/type/filename (ignore those)
      if (!fileUrl || !fileUrl.startsWith('http')) {
        return; // Legacy local path — nothing to delete from S3
      }
      const url = new URL(fileUrl);
      // Path format: /bucket/key/...
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) return;
      // First segment is bucket name, rest is the key
      const key = pathParts.slice(1).join('/');

      await this.s3.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
    } catch {
      // Non-fatal: log but don't throw
      console.warn('Failed to delete S3 object:', fileUrl);
    }
  }

  /** @deprecated Use uploadFile() instead. Kept for any legacy callers. */
  getFileUrl(uploadType: UploadType, filename: string): string {
    return `/uploads/${uploadType}/${filename}`;
  }
}
