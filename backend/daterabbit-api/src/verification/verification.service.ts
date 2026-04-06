import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Verification,
  VerificationStatus,
  VerificationType,
} from './entities/verification.entity';
import { UsersService } from '../users/users.service';
import { UploadsService } from '../uploads/uploads.service';
import { SubmitSsnDto } from './dto/submit-ssn.dto';
import { SubmitReferencesDto } from './dto/submit-references.dto';
import { SubmitConsentDto } from './dto/submit-consent.dto';
import { UserRole, UserVerificationStatus } from '../users/entities/user.entity';

@Injectable()
export class VerificationService {
  private stripe: Stripe | null = null;

  constructor(
    @InjectRepository(Verification)
    private verificationRepository: Repository<Verification>,
    private usersService: UsersService,
    private uploadsService: UploadsService,
    private configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
  }

  async startVerification(userId: string): Promise<Verification> {
    const existing = await this.verificationRepository.findOne({
      where: { userId },
    });
    if (existing) {
      return existing;
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const type =
      user.role === UserRole.COMPANION
        ? VerificationType.COMPANION
        : VerificationType.SEEKER;

    const verification = this.verificationRepository.create({
      userId,
      type,
      status: VerificationStatus.IN_PROGRESS,
    });

    return this.verificationRepository.save(verification);
  }

  async getStatus(userId: string): Promise<Verification> {
    const verification = await this.verificationRepository.findOne({
      where: { userId },
    });
    if (!verification) {
      throw new NotFoundException('Verification not started');
    }
    return verification;
  }

  async submitSsn(userId: string, dto: SubmitSsnDto): Promise<Verification> {
    const verification = await this.getOrFail(userId);
    verification.ssnLast4 = dto.ssnLast4;
    return this.verificationRepository.save(verification);
  }

  async uploadIdPhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Verification> {
    this.uploadsService.validateImageFile(file);
    const verification = await this.getOrFail(userId);

    if (verification.idPhotoUrl) {
      await this.uploadsService.deleteFile(verification.idPhotoUrl);
    }

    verification.idPhotoUrl = await this.uploadsService.uploadFile(file, 'id-photos');
    return this.verificationRepository.save(verification);
  }

  async uploadSelfie(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Verification> {
    this.uploadsService.validateImageFile(file);
    const verification = await this.getOrFail(userId);

    if (verification.selfieUrl) {
      await this.uploadsService.deleteFile(verification.selfieUrl);
    }

    verification.selfieUrl = await this.uploadsService.uploadFile(file, 'selfies');
    return this.verificationRepository.save(verification);
  }

  async uploadVideo(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Verification> {
    const verification = await this.getOrFail(userId);

    if (verification.type !== VerificationType.COMPANION) {
      throw new ForbiddenException('Video upload is for companions only');
    }

    this.uploadsService.validateVideoFile(file);

    if (verification.videoUrl) {
      await this.uploadsService.deleteFile(verification.videoUrl);
    }

    verification.videoUrl = await this.uploadsService.uploadFile(file, 'videos');
    return this.verificationRepository.save(verification);
  }

  async submitReferences(
    userId: string,
    dto: SubmitReferencesDto,
  ): Promise<Verification> {
    const verification = await this.getOrFail(userId);

    if (verification.type !== VerificationType.COMPANION) {
      throw new ForbiddenException('References are for companions only');
    }

    verification.references = dto.references;
    return this.verificationRepository.save(verification);
  }

  async submitConsent(
    userId: string,
    dto: SubmitConsentDto,
  ): Promise<Verification> {
    const verification = await this.getOrFail(userId);
    verification.consentGiven = dto.consentGiven;
    if (dto.consentGiven) {
      verification.consentDate = new Date();
    }
    return this.verificationRepository.save(verification);
  }

  async submitForReview(userId: string): Promise<Verification> {
    const verification = await this.getOrFail(userId);

    if (!verification.consentGiven) {
      throw new BadRequestException('Consent must be given before submitting');
    }

    const isDevMode = this.configService.get('DEV_AUTH') === 'true';

    if (isDevMode) {
      verification.status = VerificationStatus.PENDING_REVIEW;
      await this.verificationRepository.save(verification);

      // Auto-approve after 3 seconds in dev mode
      setTimeout(async () => {
        await this.approveVerification(userId);
      }, 3000);

      return verification;
    }

    verification.status = VerificationStatus.PENDING_REVIEW;
    return this.verificationRepository.save(verification);
  }

  async createIdentitySession(
    userId: string,
  ): Promise<{ url: string; sessionId: string }> {
    const verification = await this.getOrFail(userId);
    const isDevMode = this.configService.get('DEV_AUTH') === 'true';

    if (isDevMode) {
      // In dev mode: store a mock session ID and return a placeholder URL
      verification.stripeVerificationSessionId = `dev_vs_${userId}`;
      verification.stripeVerificationStatus = 'requires_input';
      await this.verificationRepository.save(verification);
      return {
        sessionId: verification.stripeVerificationSessionId,
        url: 'https://verify.stripe.com/start/dev-mode-mock',
      };
    }

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const session = await this.stripe.identity.verificationSessions.create({
      type: 'document',
      options: {
        document: {
          require_matching_selfie: true,
        },
      },
      metadata: { userId },
    });

    verification.stripeVerificationSessionId = session.id;
    verification.stripeVerificationStatus = session.status;
    await this.verificationRepository.save(verification);

    return { sessionId: session.id, url: session.url ?? '' };
  }

  async checkIdentityStatus(
    userId: string,
  ): Promise<{ status: string; verificationStatus: string }> {
    const verification = await this.getOrFail(userId);
    const isDevMode = this.configService.get('DEV_AUTH') === 'true';

    if (isDevMode) {
      // In dev mode: auto-approve after first check
      if (verification.stripeVerificationSessionId?.startsWith('dev_vs_')) {
        verification.stripeVerificationStatus = 'verified';
        verification.status = VerificationStatus.PENDING_REVIEW;
        await this.verificationRepository.save(verification);

        // Auto-approve after 2 seconds
        setTimeout(async () => {
          await this.approveVerification(userId);
        }, 2000);
      }
      return {
        status: 'verified',
        verificationStatus: verification.status,
      };
    }

    if (!this.stripe || !verification.stripeVerificationSessionId) {
      return {
        status: verification.stripeVerificationStatus || 'requires_input',
        verificationStatus: verification.status,
      };
    }

    const session = await this.stripe.identity.verificationSessions.retrieve(
      verification.stripeVerificationSessionId,
    );

    verification.stripeVerificationStatus = session.status;

    if (session.status === 'verified') {
      verification.status = VerificationStatus.PENDING_REVIEW;
      await this.verificationRepository.save(verification);
      // Trigger approval with age check — in production this would come via webhook
      await this.approveOrRejectByAge(userId, session);
    } else {
      await this.verificationRepository.save(verification);
    }

    return {
      status: session.status,
      verificationStatus: verification.status,
    };
  }

  async handleStripeIdentityWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<{ received: boolean }> {
    if (!this.stripe) {
      return { received: true };
    }

    const webhookSecret = this.configService.get<string>(
      'STRIPE_IDENTITY_WEBHOOK_SECRET',
    );

    let event: import('stripe').Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret ?? '',
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    switch (event.type) {
      case 'identity.verification_session.verified': {
        const session = event.data.object as import('stripe').Stripe.Identity.VerificationSession;
        const verification = await this.verificationRepository.findOne({
          where: { stripeVerificationSessionId: session.id },
        });
        if (!verification) break;
        verification.stripeVerificationStatus = 'verified';
        await this.verificationRepository.save(verification);
        await this.approveOrRejectByAge(verification.userId, session);
        break;
      }
      case 'identity.verification_session.requires_input': {
        const session = event.data.object as import('stripe').Stripe.Identity.VerificationSession;
        const verification = await this.verificationRepository.findOne({
          where: { stripeVerificationSessionId: session.id },
        });
        if (!verification) break;
        verification.stripeVerificationStatus = 'requires_input';
        await this.verificationRepository.save(verification);
        break;
      }
    }

    return { received: true };
  }

  async handleWebhook(payload: any): Promise<{ received: boolean }> {
    // Mock webhook endpoint for future Checkr integration
    // In production, this would process Checkr background check results
    const { candidateId, reportId, status } = payload;

    if (candidateId && reportId) {
      const verification = await this.verificationRepository.findOne({
        where: { checkrCandidateId: candidateId },
      });

      if (verification) {
        if (status === 'clear') {
          await this.approveVerification(verification.userId);
        } else if (status === 'consider' || status === 'dispute') {
          verification.status = VerificationStatus.REJECTED;
          verification.rejectionReason = `Background check result: ${status}`;
          verification.checkrReportId = reportId;
          await this.verificationRepository.save(verification);
          await this.usersService.update(verification.userId, {
            isVerified: false,
          });
        }
      }
    }

    return { received: true };
  }

  private async approveOrRejectByAge(
    userId: string,
    session: import('stripe').Stripe.Identity.VerificationSession,
  ): Promise<void> {
    const dob = session.verified_outputs?.dob;
    if (!dob || dob.year == null || dob.month == null || dob.day == null) {
      const verification = await this.verificationRepository.findOne({ where: { userId } });
      if (!verification) return;
      verification.status = VerificationStatus.REJECTED;
      verification.rejectionReason = 'Age could not be verified';
      await this.verificationRepository.save(verification);
      await this.usersService.update(userId, {
        isVerified: false,
        verificationStatus: UserVerificationStatus.REJECTED,
      });
      return;
    }

    // Stripe month is 1-indexed; JS Date month is 0-indexed
    const birthDate = new Date(dob.year, dob.month - 1, dob.day);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 21) {
      const verification = await this.verificationRepository.findOne({ where: { userId } });
      if (!verification) return;
      verification.status = VerificationStatus.REJECTED;
      verification.rejectionReason = 'Under 21: age verification failed';
      await this.verificationRepository.save(verification);
      await this.usersService.update(userId, {
        isVerified: false,
        verificationStatus: UserVerificationStatus.REJECTED,
      });
      return;
    }

    await this.approveVerification(userId);
  }

  private async approveVerification(userId: string): Promise<void> {
    const verification = await this.verificationRepository.findOne({
      where: { userId },
    });
    if (!verification) return;

    verification.status = VerificationStatus.APPROVED;
    await this.verificationRepository.save(verification);
    await this.usersService.update(userId, {
      isVerified: true,
      verificationStatus: UserVerificationStatus.APPROVED,
    });
  }

  private async getOrFail(userId: string): Promise<Verification> {
    const verification = await this.verificationRepository.findOne({
      where: { userId },
    });
    if (!verification) {
      throw new NotFoundException(
        'Verification not started. Call POST /start first.',
      );
    }
    return verification;
  }
}
