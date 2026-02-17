import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private brevoApiKey: string;
  private senderEmail: string;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.brevoApiKey = this.configService.get('BREVO_API_KEY') || '';
    this.senderEmail = this.configService.get('BREVO_SENDER_EMAIL') || 'noreply@diagrams.love';
  }

  generateOtp(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
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

    // Send email via Brevo API
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: this.senderEmail, name: 'DateRabbit' },
          to: [{ email }],
          subject: 'Your DateRabbit Verification Code',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #FF6B6B;">DateRabbit</h2>
              <p>Your verification code is:</p>
              <h1 style="font-size: 32px; letter-spacing: 4px; color: #333;">${otp}</h1>
              <p style="color: #666;">This code expires in 10 minutes.</p>
            </div>
          `,
        }),
      });
      if (response.ok) {
        console.log(`OTP sent to ${email}`);
      } else {
        console.error('Brevo API error:', await response.text());
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      // Continue anyway for development
    }

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

    if (user.otpCode !== code) {
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
