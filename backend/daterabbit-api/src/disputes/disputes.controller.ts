import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post(':id/dispute')
  async createDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { reason: string },
  ) {
    if (!body.reason || !body.reason.trim()) {
      throw new HttpException('reason is required', HttpStatus.BAD_REQUEST);
    }
    return this.disputesService.createDispute(id, req.user.id, body.reason.trim());
  }
}
