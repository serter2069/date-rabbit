import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReferralService } from './referral.service';
import { ApplyReferralDto } from './dto/apply-referral.dto';

@Controller('referral')
@UseGuards(JwtAuthGuard)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('my-code')
  async getMyCode(@Request() req: any) {
    return this.referralService.getMyCode(req.user.id);
  }

  @Post('apply')
  async applyCode(@Request() req: any, @Body() dto: ApplyReferralDto) {
    return this.referralService.applyCode(req.user.id, dto.code);
  }

  @Get('my-bonus')
  async getMyBonus(@Request() req: any) {
    return this.referralService.getMyBonus(req.user.id);
  }

  @Get('my-stats')
  async getMyStats(@Request() req: any) {
    return this.referralService.getMyStats(req.user.id);
  }
}
