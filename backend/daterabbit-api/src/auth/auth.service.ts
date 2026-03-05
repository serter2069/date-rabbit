import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  generateOtp(): string {
    // DEV mode: fixed code for quick testing
    if (this.configService.get('DEV_AUTH') === 'true') {
      return '000000';
    }
    return crypto.randomInt(100000, 1000000).toString();
  }

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

    await this.emailService.sendOtp(email, otp);

    return { success: true, isNewUser };
  }

  async verifyOtp(email: string, code: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return { success: false, error: 'No OTP requested' };
    }

    if (new Date() > user.otpExpiresAt) {
      return { success: false, error: 'OTP expired' };
    }

    const isValid = user.otpCode.length === code.length &&
      crypto.timingSafeEqual(Buffer.from(user.otpCode), Buffer.from(code));
    if (!isValid) {
      // Invalidate OTP after failed attempt to prevent brute-force
      await this.usersService.clearOtp(user.id);
      return { success: false, error: 'Invalid OTP' };
    }

    // Clear OTP
    await this.usersService.clearOtp(user.id);

    // Generate JWT
    const token = this.jwtService.sign({ id: user.id, email: user.email });

    const { otpCode, otpExpiresAt, ...safeUser } = user;
    return { success: true, token, user: safeUser as User };
  }

  async register(data: {
    email: string;
    name: string;
    role: UserRole;
    age?: number;
    location?: string;
    bio?: string;
    hourlyRate?: number;
  }): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    let user = await this.usersService.findByEmail(data.email);

    if (user) {
      // Update existing user
      const updated = await this.usersService.update(user.id, data);
      if (!updated) {
        return { success: false, error: 'Failed to update user' };
      }
      user = updated;
    } else {
      // Create new user
      user = await this.usersService.create(data);
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });
    const { otpCode, otpExpiresAt, ...safeUser } = user;

    return { success: true, token, user: safeUser as User };
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
