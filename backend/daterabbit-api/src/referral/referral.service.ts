import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral, ReferralBonusType, ReferralStatus } from './entities/referral.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get the current user's referral code. Generate one if missing.
   */
  async getMyCode(userId: string): Promise<{ code: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.referralCode) {
      const code = await this.generateUniqueCode();
      await this.userRepository.update(userId, { referralCode: code });
      return { code };
    }

    return { code: user.referralCode };
  }

  /**
   * Apply a referral code during or after registration.
   */
  async applyCode(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Seekers only
    if (user.role !== UserRole.SEEKER) {
      throw new BadRequestException('Only seekers can apply referral codes');
    }

    // Already referred
    if (user.referredBy) {
      throw new BadRequestException('You have already used a referral code');
    }

    // Find referrer by code
    const referrer = await this.userRepository.findOne({ where: { referralCode: code } });
    if (!referrer) {
      throw new BadRequestException('Invalid referral code');
    }

    // Self-referral check
    if (referrer.id === userId) {
      throw new BadRequestException('You cannot use your own referral code');
    }

    // Save referral link
    await this.userRepository.update(userId, { referredBy: referrer.id });

    // Create pending referral record
    const referral = this.referralRepository.create({
      referrerId: referrer.id,
      refereeId: userId,
      bonusType: ReferralBonusType.BGC_DISCOUNT_50,
      status: ReferralStatus.PENDING,
    });
    await this.referralRepository.save(referral);

    return { success: true, message: 'Referral code applied! You will get 50% off your Background Check.' };
  }

  /**
   * Get the current user's referral bonus status.
   */
  async getMyBonus(userId: string): Promise<{ hasBgcDiscount: boolean; discountPercent: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.referredBy) {
      return { hasBgcDiscount: false, discountPercent: 0 };
    }

    const referral = await this.referralRepository.findOne({
      where: { refereeId: userId, bonusType: ReferralBonusType.BGC_DISCOUNT_50 },
    });

    if (!referral) {
      return { hasBgcDiscount: false, discountPercent: 0 };
    }

    // Discount available if referral is pending (not yet used) or credited
    return { hasBgcDiscount: true, discountPercent: 50 };
  }

  /**
   * Credit the referral bonus after the referee's first completed booking.
   * Called from BookingsService.complete().
   */
  async creditBonus(refereeId: string): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: {
        refereeId,
        bonusType: ReferralBonusType.BGC_DISCOUNT_50,
        status: ReferralStatus.PENDING,
      },
    });

    if (!referral) {
      return; // No pending referral to credit
    }

    await this.referralRepository.update(referral.id, {
      status: ReferralStatus.CREDITED,
      creditedAt: new Date(),
    });
  }

  /**
   * Get referral stats for the current user (as referrer).
   */
  async getMyStats(userId: string): Promise<{ invited: number; credited: number }> {
    const invited = await this.referralRepository.count({
      where: { referrerId: userId },
    });
    const credited = await this.referralRepository.count({
      where: { referrerId: userId, status: ReferralStatus.CREDITED },
    });
    return { invited, credited };
  }

  /**
   * Generate a unique DR-XXXXX code with collision retry (max 3 attempts).
   */
  private async generateUniqueCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let attempt = 0; attempt < 3; attempt++) {
      let suffix = '';
      for (let i = 0; i < 5; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const code = `DR-${suffix}`;
      const existing = await this.userRepository.findOne({ where: { referralCode: code } });
      if (!existing) {
        return code;
      }
    }
    throw new BadRequestException('Failed to generate unique referral code. Please try again.');
  }
}
