import { Controller, Post, Body, HttpException, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Alias for admin panel compatibility
  @Post('send-otp')
  @Throttle({ default: { limit: 3, ttl: 900000 } })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.startAuth(body);
  }

  @Post('start')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 emails per 15 minutes
  async startAuth(@Body() body: SendOtpDto) {
    const result = await this.authService.startAuth(body.email);
    return result;
  }

  // Alias for admin panel compatibility
  @Post('verify-otp')
  @Throttle({ default: { limit: 10, ttl: 600000 } })
  async verifyOtpAlias(@Body() body: VerifyOtpDto) {
    return this.verifyOtp(body);
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 600000 } }) // 10 OTP attempts per 10 min
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(body.email, body.code);

    if (!result.success) {
      throw new HttpException(result.error || 'Verification failed', HttpStatus.UNAUTHORIZED);
    }

    return result;
  }

  /**
   * POST /auth/refresh
   * Accepts a valid refresh token, revokes it, and returns a new access+refresh pair.
   * Rate limited to 30 calls per 10 minutes to prevent brute-force.
   */
  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 600000 } })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.rotateRefreshToken(body.refreshToken);
  }

  /**
   * POST /auth/logout
   * Revokes all refresh tokens for the authenticated user.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    await this.authService.revokeAllUserTokens(req.user.id);
    return { success: true };
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(
    @Request() req,
    @Body() body: {
      name: string;
      role: 'seeker' | 'companion';
      age?: number;
      location?: string;
      bio?: string;
      hourlyRate?: number;
    },
  ) {
    if (!body.name) {
      throw new HttpException('Name is required', HttpStatus.BAD_REQUEST);
    }

    if (body.bio !== undefined) {
      const bioTrimmed = (body.bio || '').trim();
      if (bioTrimmed.length < 20) {
        throw new HttpException('Bio must be at least 20 characters', HttpStatus.BAD_REQUEST);
      }
      if (bioTrimmed.length > 500) {
        throw new HttpException('Bio must be 500 characters or less', HttpStatus.BAD_REQUEST);
      }
    }

    // Email always from JWT token (set by JwtAuthGuard)
    const email: string = req.user.email;

    const result = await this.authService.register({
      email,
      name: body.name,
      role: body.role === 'companion' ? UserRole.COMPANION : UserRole.SEEKER,
      age: body.age,
      location: body.location,
      bio: body.bio,
      hourlyRate: body.hourlyRate,
    });

    return result;
  }
}
