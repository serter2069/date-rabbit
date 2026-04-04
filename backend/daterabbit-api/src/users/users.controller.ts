import { Controller, Get, Post, Put, Patch, Delete, Body, UseGuards, Request, Param, BadRequestException, ParseUUIDPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UploadsService } from '../uploads/uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private uploadsService: UploadsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Patch('heartbeat')
  async heartbeat(@Request() req) {
    await this.usersService.updateLastSeen(req.user.id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/push-token')
  async updatePushToken(@Request() req, @Body() body: { expoPushToken: string }) {
    const token = body?.expoPushToken;
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('expoPushToken is required');
    }
    await this.usersService.updatePushToken(req.user.id, token);
    return { success: true };
  }

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
    const { name, age, location, bio, photos, hourlyRate, notificationsEnabled, expoPushToken, notificationPreferences, isPublicProfile } = body;

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
      notificationsEnabled,
      expoPushToken,
      notificationPreferences,
      isPublicProfile,
    });
    if (!updated) {
      return { error: 'User not found' };
    }
    const { otpCode, otpExpiresAt, ...safeUser } = updated;
    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/photos/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    this.uploadsService.validateImageFile(file);
    const url = await this.uploadsService.uploadFile(file, 'profile-photos');
    return { url };
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

  @UseGuards(JwtAuthGuard)
  @Get('watch-online')
  async getWatchedOnline(@Request() req) {
    const watchedIds = await this.usersService.getWatchedCompanionIds(req.user.id);
    return { watchedIds };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/watch-online')
  async watchOnline(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    await this.usersService.watchCompanion(req.user.id, id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/watch-online')
  async unwatchOnline(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    await this.usersService.unwatchCompanion(req.user.id, id);
    return { success: true };
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
      lastSeen: user.lastSeen ? user.lastSeen.toISOString() : null,
    };
  }
}
