import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UserRole } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('start')
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 emails per hour
  async startAuth(@Body() body: { email: string }) {
    if (!body.email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.authService.startAuth(body.email.toLowerCase());
    return result;
  }

  @Post('verify')
  @Throttle({ default: { limit: 20, ttl: 600000 } }) // 20 OTP attempts per 10 min
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
  async register(@Body() body: {
    email: string;
    name: string;
    role: 'seeker' | 'companion';
    age?: number;
    location?: string;
    bio?: string;
    hourlyRate?: number;
  }) {
    if (!body.email || !body.name) {
      throw new HttpException('Email and name are required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.authService.register({
      email: body.email.toLowerCase(),
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
