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
} from '@nestjs/common';
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
    return this.verificationService.uploadIdPhoto(req.user.id, file);
  }

  @Post('selfie')
  @UseInterceptors(FileInterceptor('file'))
  uploadSelfie(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.verificationService.uploadSelfie(req.user.id, file);
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
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

  // Webhook moved to a separate unguarded controller below
}

// Separate controller for external webhooks — no JWT guard
@Controller('verification')
export class VerificationWebhookController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('webhook')
  handleWebhook(
    @Body() payload: any,
    @Req() req: any,
  ) {
    // Validate webhook signature from Checkr
    const signature = req.headers['x-checkr-signature'];
    if (!signature) {
      throw new HttpException('Missing webhook signature', HttpStatus.UNAUTHORIZED);
    }

    // TODO: Verify HMAC signature against CHECKR_WEBHOOK_SECRET when configured
    // For now, log the webhook but don't auto-approve verifications
    console.log('Verification webhook received (signature validation pending)');
    return { received: true };
  }
}
