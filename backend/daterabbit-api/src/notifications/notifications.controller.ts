import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const notifications = await this.notificationsService.getByUser(
      req.user.id,
      Math.min(limit ? parseInt(limit) || 20 : 20, 50),
      offset ? parseInt(offset) || 0 : 0,
    );

    return notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.notificationsService.markAsRead(id, req.user.id);
    return { success: true };
  }

  @Put('read-all')
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true };
  }

  // ─── Preferences ────────────────────────────────────────────────────────────

  @Get('preferences')
  async getPreferences(@Request() req) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @Put('preferences/:eventType')
  async updatePreference(
    @Param('eventType') eventType: string,
    @Body() body: { emailEnabled?: boolean; pushEnabled?: boolean; inappEnabled?: boolean },
    @Request() req,
  ) {
    return this.notificationsService.updatePreference(req.user.id, eventType, body);
  }

  @Post('preferences/reset')
  async resetPreferences(@Request() req) {
    await this.notificationsService.resetPreferences(req.user.id);
    return { success: true };
  }
}
