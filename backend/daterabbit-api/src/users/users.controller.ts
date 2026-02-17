import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      return { error: 'User not found' };
    }
    // Don't return sensitive data
    const { otpCode, otpExpiresAt, ...safeUser } = user;
    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Request() req, @Body() body: any) {
    const { name, age, location, bio, photos, hourlyRate } = body;
    const updated = await this.usersService.update(req.user.id, {
      name,
      age,
      location,
      bio,
      photos,
      hourlyRate,
    });
    if (!updated) {
      return { error: 'User not found' };
    }
    const { otpCode, otpExpiresAt, ...safeUser } = updated;
    return safeUser;
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return { error: 'User not found' };
    }
    // Return public profile only
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      age: user.age,
      location: user.location,
      bio: user.bio,
      photos: user.photos,
      hourlyRate: user.hourlyRate,
      rating: user.rating,
      reviewCount: user.reviewCount,
      isVerified: user.isVerified,
    };
  }
}
