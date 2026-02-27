import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
  Req,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // --- Connect ---

  @Post('connect/onboard')
  @UseGuards(JwtAuthGuard)
  async createConnectAccount(@Request() req) {
    return this.paymentsService.createConnectAccount(req.user.id);
  }

  @Get('connect/status')
  @UseGuards(JwtAuthGuard)
  async getConnectStatus(@Request() req) {
    return this.paymentsService.getConnectStatus(req.user.id);
  }

  // --- Payment ---

  @Post('bookings/:bookingId/pay')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Request() req,
    @Param('bookingId') bookingId: string,
  ) {
    return this.paymentsService.createPaymentIntent(req.user.id, bookingId);
  }

  // --- Earnings ---

  @Get('earnings')
  @UseGuards(JwtAuthGuard)
  async getEarnings(@Request() req) {
    return this.paymentsService.getEarnings(req.user.id);
  }

  @Get('earnings/history')
  @UseGuards(JwtAuthGuard)
  async getEarningsHistory(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.paymentsService.getEarningsHistory(req.user.id, +page, +limit);
  }

  // --- Payouts ---

  @Get('payouts/balance')
  @UseGuards(JwtAuthGuard)
  async getPayoutBalance(@Request() req) {
    return this.paymentsService.getPayoutBalance(req.user.id);
  }

  @Post('payouts/create')
  @UseGuards(JwtAuthGuard)
  async createPayout(@Request() req, @Body() body: { amount?: number }) {
    return this.paymentsService.createPayout(req.user.id, body.amount);
  }

  @Get('payouts/history')
  @UseGuards(JwtAuthGuard)
  async getPayoutHistory(
    @Request() req,
    @Query('limit') limit = 10,
  ) {
    return this.paymentsService.getPayoutHistory(req.user.id, +limit);
  }
}

// Separate controller for webhooks (no auth, needs raw body)
@Controller('webhooks')
@SkipThrottle()
export class WebhooksController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: ExpressRequest & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    await this.paymentsService.handleWebhook(req.rawBody ?? Buffer.from(''), signature);
    return { received: true };
  }
}
