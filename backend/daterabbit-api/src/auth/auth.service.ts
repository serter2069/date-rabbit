import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { sanitizeText } from '../common/sanitize';
import { RefreshToken } from './entities/refresh-token.entity';

// Refresh token TTL: 30 days sliding window
const REFRESH_TOKEN_TTL_DAYS = 30;

@Injectable()
export class AuthService {
  // OTP brute-force limits — attempt counter is stored in DB so PM2 cluster instances share state
  private readonly MAX_OTP_ATTEMPTS = 3;
  private readonly LOCKOUT_MINUTES = 15;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  generateOtp(): string {
    // DEV mode: fixed code for quick testing
    if (this.configService.get('DEV_AUTH') === 'true') {
      return '000000';
    }
    return crypto.randomInt(100000, 1000000).toString();
  }

  // ─── Refresh token helpers ─────────────────────────────────────────────────

  private hashToken(plainToken: string): string {
    return crypto.createHash('sha256').update(plainToken).digest('hex');
  }

  /**
   * Creates a new refresh token in DB for the given userId.
   * Returns the PLAIN token (stored only once, never persisted in plain form).
   */
  async createRefreshToken(userId: string): Promise<string> {
    const plainToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(plainToken);

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    const entity = this.refreshTokensRepository.create({
      userId,
      tokenHash,
      expiresAt,
      isRevoked: false,
    });
    await this.refreshTokensRepository.save(entity);

    return plainToken;
  }

  /**
   * Validates the incoming plain refresh token, revokes it, and issues a new pair.
   * Implements token rotation: each refresh token can only be used once.
   */
  async rotateRefreshToken(plainToken: string): Promise<{
    accessToken: string;
    token: string; // backward compat alias
    refreshToken: string;
    user: Partial<User>;
  }> {
    const tokenHash = this.hashToken(plainToken);

    const stored = await this.refreshTokensRepository.findOne({
      where: { tokenHash },
    });

    if (!stored) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    if (stored.isRevoked) {
      // Token reuse detected — revoke all tokens for this user (security measure)
      await this.revokeAllUserTokens(stored.userId);
      throw new HttpException(
        'Refresh token already used. Please log in again.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (stored.expiresAt < new Date()) {
      throw new HttpException('Refresh token expired', HttpStatus.UNAUTHORIZED);
    }

    // Revoke the used token (rotation — each token usable exactly once)
    await this.refreshTokensRepository.update(stored.id, { isRevoked: true });

    const user = await this.usersService.findById(stored.userId);
    if (!user || !user.isActive || user.deletedAt) {
      throw new HttpException('Account is deactivated', HttpStatus.UNAUTHORIZED);
    }

    // Issue new pair
    const accessToken = this.jwtService.sign({ id: user.id, email: user.email });
    const newRefreshToken = await this.createRefreshToken(user.id);

    const { otpCode, otpExpiresAt, otpAttempts, otpLockedUntil, ...safeUser } = user;

    return {
      accessToken,
      token: accessToken, // backward compat
      refreshToken: newRefreshToken,
      user: safeUser,
    };
  }

  /**
   * Revokes all refresh tokens for a user (used on logout and on token reuse detection).
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokensRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  // ─── OTP Auth ──────────────────────────────────────────────────────────────

  async startAuth(email: string): Promise<{ success: boolean; isNewUser: boolean }> {
    let user = await this.usersService.findByEmail(email);
    const isNewUser = !user;

    if (!user) {
      user = await this.usersService.create({
        email,
        name: email.split('@')[0],
        role: UserRole.SEEKER,
      });
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.setOtp(user.id, otp, expiresAt);

    // DEV mode: skip email sending
    if (this.configService.get('DEV_AUTH') === 'true') {
      console.log(`DEV MODE: OTP for ${email} -> 000000 (email not sent)`);
      return { success: true, isNewUser };
    }

    const emailSent = await this.emailService.sendOtp(email, otp);

    if (!emailSent) {
      throw new HttpException(
        'Failed to send verification email. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return { success: true, isNewUser };
  }

  async verifyOtp(
    email: string,
    code: string,
  ): Promise<{
    success: boolean;
    accessToken?: string;
    token?: string; // backward compat alias — old mobile clients read result.token
    refreshToken?: string;
    user?: User;
    error?: string;
  }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check per-user lockout stored in DB (shared across all PM2 cluster instances)
    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.otpLockedUntil.getTime() - Date.now()) / 60000);
      throw new HttpException(
        `Too many attempts. Try again in ${minutesLeft} minutes`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return { success: false, error: 'No OTP requested' };
    }

    if (new Date() > user.otpExpiresAt) {
      return { success: false, error: 'OTP expired' };
    }

    const isValid =
      user.otpCode.length === code.length &&
      crypto.timingSafeEqual(Buffer.from(user.otpCode), Buffer.from(code));

    if (!isValid) {
      // Increment attempt counter in DB — visible to all PM2 cluster instances
      const newCount = await this.usersService.incrementOtpAttempts(
        user.id,
        this.LOCKOUT_MINUTES,
        this.MAX_OTP_ATTEMPTS,
      );
      if (newCount >= this.MAX_OTP_ATTEMPTS) {
        // Invalidate OTP so it cannot be used even if lockout is bypassed
        await this.usersService.clearOtp(user.id);
        return { success: false, error: 'Too many failed attempts. Please request a new code.' };
      }
      return { success: false, error: 'Invalid OTP' };
    }

    // Successful verification — reset attempts and clear OTP
    await this.usersService.resetOtpAttempts(user.id);
    await this.usersService.clearOtp(user.id);

    // Generate access + refresh token pair
    const accessToken = this.jwtService.sign({ id: user.id, email: user.email });
    const refreshToken = await this.createRefreshToken(user.id);

    const { otpCode, otpExpiresAt, otpAttempts, otpLockedUntil, ...safeUser } = user;
    return {
      success: true,
      accessToken,
      token: accessToken, // backward compat — old clients read result.token
      refreshToken,
      user: safeUser as User,
    };
  }

  async register(data: {
    email: string;
    name: string;
    role: UserRole;
    age?: number;
    location?: string;
    bio?: string;
    hourlyRate?: number;
  }): Promise<{
    success: boolean;
    accessToken?: string;
    token?: string; // backward compat alias
    refreshToken?: string;
    user?: User;
    error?: string;
  }> {
    // Sanitize user-facing text fields
    const sanitizedData = {
      ...data,
      name: sanitizeText(data.name),
      bio: data.bio ? sanitizeText(data.bio) : data.bio,
      location: data.location ? sanitizeText(data.location) : data.location,
    };

    let user = await this.usersService.findByEmail(data.email);

    if (user) {
      // Update existing user
      const updated = await this.usersService.update(user.id, sanitizedData);
      if (!updated) {
        return { success: false, error: 'Failed to update user' };
      }
      user = updated;
    } else {
      // Create new user
      user = await this.usersService.create(sanitizedData);
    }

    const accessToken = this.jwtService.sign({ id: user.id, email: user.email });
    const refreshToken = await this.createRefreshToken(user.id);

    const { otpCode, otpExpiresAt, otpAttempts, otpLockedUntil, ...safeUser } = user;

    return {
      success: true,
      accessToken,
      token: accessToken, // backward compat — old clients read result.token
      refreshToken,
      user: safeUser as User,
    };
  }

  validateToken(token: string): { id: string; email: string } | null {
    try {
      const payload = this.jwtService.verify(token);
      return { id: payload.id, email: payload.email };
    } catch {
      return null;
    }
  }
}
