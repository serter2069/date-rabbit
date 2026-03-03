import { Controller, Get, Put, Body, UseGuards, Request, Param, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

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
  async updateProfile(@Request() req, @Body() body: UpdateUserDto) {
    const { name, age, location, bio, photos, hourlyRate } = body;

    // Validate hourlyRate if provided
    if (hourlyRate !== undefined && hourlyRate !== null) {
      if (typeof hourlyRate !== 'number' || isNaN(hourlyRate)) {
        throw new BadRequestException('Hourly rate must be a number');
      }
      if (hourlyRate <= 0) {
        throw new BadRequestException('Hourly rate must be greater than 0');
      }
      if (hourlyRate >= 10000) {
        throw new BadRequestException('Hourly rate must be less than 10000');
      }
    }

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
