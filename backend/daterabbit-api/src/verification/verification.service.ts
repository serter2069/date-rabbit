import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
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
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Verification)
    private verificationRepository: Repository<Verification>,
    private usersService: UsersService,
    private uploadsService: UploadsService,
    private configService: ConfigService,
  ) {}

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
      this.uploadsService.deleteFile(verification.idPhotoUrl);
    }

    verification.idPhotoUrl = this.uploadsService.getFileUrl(
      'id-photos',
      file.filename,
    );
    return this.verificationRepository.save(verification);
  }

  async uploadSelfie(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Verification> {
    this.uploadsService.validateImageFile(file);
    const verification = await this.getOrFail(userId);

    if (verification.selfieUrl) {
      this.uploadsService.deleteFile(verification.selfieUrl);
    }

    verification.selfieUrl = this.uploadsService.getFileUrl(
      'selfies',
      file.filename,
    );
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
      this.uploadsService.deleteFile(verification.videoUrl);
    }

    verification.videoUrl = this.uploadsService.getFileUrl(
      'videos',
      file.filename,
    );
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

  private async approveVerification(userId: string): Promise<void> {
    const verification = await this.verificationRepository.findOne({
      where: { userId },
    });
    if (!verification) return;

    verification.status = VerificationStatus.APPROVED;
    await this.verificationRepository.save(verification);
    await this.usersService.update(userId, { isVerified: true });
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
