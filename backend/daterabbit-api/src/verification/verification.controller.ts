import { createHmac, timingSafeEqual } from 'crypto';
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerificationService } from './verification.service';
import { UploadsService } from '../uploads/uploads.service';
import { SubmitSsnDto } from './dto/submit-ssn.dto';
import { SubmitReferencesDto } from './dto/submit-references.dto';
import { SubmitConsentDto } from './dto/submit-consent.dto';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Post('start')
  start(@Req() req: any) {
    return this.verificationService.startVerification(req.user.id);
  }

  @Get('status')
  getStatus(@Req() req: any) {
    return this.verificationService.getStatus(req.user.id);
  }

  @Post('ssn')
  submitSsn(@Req() req: any, @Body() dto: SubmitSsnDto) {
    return this.verificationService.submitSsn(req.user.id, dto);
  }

  @Post('upload-id')
  @UseInterceptors(FileInterceptor('file'))
  uploadId(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided or invalid file type');
    return this.verificationService.uploadIdPhoto(req.user.id, file);
  }

  @Post('selfie')
  @UseInterceptors(FileInterceptor('file'))
  uploadSelfie(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided or invalid file type');
    return this.verificationService.uploadSelfie(req.user.id, file);
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided or invalid file type');
    return this.verificationService.uploadVideo(req.user.id, file);
  }

  @Post('references')
  submitReferences(@Req() req: any, @Body() dto: SubmitReferencesDto) {
    return this.verificationService.submitReferences(req.user.id, dto);
  }

  @Post('consent')
  submitConsent(@Req() req: any, @Body() dto: SubmitConsentDto) {
    return this.verificationService.submitConsent(req.user.id, dto);
  }

  @Post('submit')
  submitForReview(@Req() req: any) {
    return this.verificationService.submitForReview(req.user.id);
  }

  @Post('identity-session')
  createIdentitySession(@Req() req: any) {
    return this.verificationService.createIdentitySession(req.user.id);
  }

  @Get('identity-status')
  checkIdentityStatus(@Req() req: any) {
    return this.verificationService.checkIdentityStatus(req.user.id);
  }

  // Webhook moved to a separate unguarded controller below
}

// Separate controller for external webhooks — no JWT guard
@Controller('verification')
export class VerificationWebhookController {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly configService: ConfigService,
  ) {}

  @Post('stripe-identity-webhook')
  handleStripeIdentityWebhook(@Req() req: any) {
    const rawBody: Buffer = req.rawBody;
    const signature = req.headers['stripe-signature'] as string;
    return this.verificationService.handleStripeIdentityWebhook(rawBody, signature);
  }

  @Post('webhook')
  handleWebhook(
    @Body() payload: any,
    @Req() req: any,
  ) {
    const secret = this.configService.get<string>('CHECKR_WEBHOOK_SECRET');

    if (!secret) {
      // Secret not configured — skip HMAC check (e.g. staging without Checkr)
      console.warn('CHECKR_WEBHOOK_SECRET not configured — skipping HMAC validation');
    } else {
      const signature = req.headers['x-checkr-signature'] as string | undefined;

      if (!signature) {
        throw new HttpException('Missing webhook signature', HttpStatus.UNAUTHORIZED);
      }

      // Compute expected HMAC-SHA256 over the raw body
      const rawBody: Buffer = req.rawBody;
      const expectedHex = createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedHex, 'utf8');
      const receivedBuf = Buffer.from(signature, 'utf8');

      // Lengths must match before timingSafeEqual (it throws otherwise)
      if (
        expectedBuf.length !== receivedBuf.length ||
        !timingSafeEqual(expectedBuf, receivedBuf)
      ) {
        throw new HttpException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
      }
    }

    return this.verificationService.handleWebhook(payload);
  }
}
