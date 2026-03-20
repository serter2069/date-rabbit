import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Post('block')
  async blockDate(@Request() req, @Body() dto: CreateBlockedDateDto) {
    return this.calendarService.blockDate(req.user.id, dto);
  }

  @Get('blocked')
  async getBlockedDates(@Request() req) {
    return this.calendarService.getBlockedDates(req.user.id);
  }

  @Delete('block/:id')
  async removeBlock(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.calendarService.removeBlock(req.user.id, id);
    return { success: true };
  }
}
