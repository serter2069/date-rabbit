import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request, Param, BadRequestException, ParseUUIDPipe } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(@Request() req) {
    await this.usersService.deactivateAccount(req.user.id);
    return { success: true, message: 'Account deactivated' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async getFavorites(@Request() req) {
    const favorites = await this.usersService.getFavorites(req.user.id);
    return { favorites };
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites/:companionId')
  async addFavorite(
    @Request() req,
    @Param('companionId', ParseUUIDPipe) companionId: string,
  ) {
    await this.usersService.addFavorite(req.user.id, companionId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favorites/:companionId')
  async removeFavorite(
    @Request() req,
    @Param('companionId', ParseUUIDPipe) companionId: string,
  ) {
    await this.usersService.removeFavorite(req.user.id, companionId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('blocked')
  async getBlockedUsers(@Request() req) {
    const blocked = await this.usersService.getBlockedUsers(req.user.id);
    return blocked.map((b) => ({
      id: b.blocked.id,
      name: b.blocked.name,
      blockedAt: b.createdAt,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/block')
  async blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { reason?: string },
  ) {
    await this.usersService.blockUser(req.user.id, id, body?.reason);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/block')
  async unblockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    await this.usersService.unblockUser(req.user.id, id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  async reportUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { reason: string; description?: string },
  ) {
    if (!body?.reason) {
      throw new BadRequestException('Reason is required');
    }
    await this.usersService.reportUser(req.user.id, id, body.reason, body.description);
    return { success: true, message: 'Report submitted successfully' };
  }

  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
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
