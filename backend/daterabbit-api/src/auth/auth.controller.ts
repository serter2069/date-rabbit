import { Controller, Post, Body, HttpException, HttpStatus, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UserRole } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('start')
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 emails per hour
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
  async register(
    @Request() req,
    @Body() body: {
      email?: string;
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

    // If JWT provided, use email from token (more secure)
    // Otherwise require email in body (frontend compat)
    let email: string;
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const decoded = this.authService.validateToken(authHeader.slice(7));
      if (decoded) {
        email = decoded.email;
      } else if (body.email) {
        email = body.email.toLowerCase();
      } else {
        throw new HttpException('Authentication required', HttpStatus.UNAUTHORIZED);
      }
    } else if (body.email) {
      email = body.email.toLowerCase();
    } else {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

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
