import { Controller, Post, Body, HttpException, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Alias for admin panel compatibility
  @Post('send-otp')
  @Throttle({ default: { limit: 3, ttl: 900000 } })
  async sendOtp(@Body() body: { email: string }) {
    return this.startAuth(body);
  }

  @Post('start')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 emails per 15 minutes
  async startAuth(@Body() body: { email: string }) {
    if (!body || !body.email || typeof body.email !== 'string') {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    if (body.email.length > 254) {
      throw new HttpException('Email too long', HttpStatus.BAD_REQUEST);
    }

    const email = body.email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const result = await this.authService.startAuth(email);
    return result;
  }

  // Alias for admin panel compatibility
  @Post('verify-otp')
  @Throttle({ default: { limit: 10, ttl: 600000 } })
  async verifyOtpAlias(@Body() body: { email: string; code: string }) {
    return this.verifyOtp(body);
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 600000 } }) // 10 OTP attempts per 10 min
  async verifyOtp(@Body() body: { email: string; code: string }) {
    if (!body.email || !body.code) {
      throw new HttpException('Email and code are required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.authService.verifyOtp(body.email.toLowerCase(), body.code);

    if (!result.success) {
      throw new HttpException(result.error || 'Verification failed', HttpStatus.UNAUTHORIZED);
    }

    return result;
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
