import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User, UserRole } from '../users/entities/user.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { PlatformSettings } from '../admin/entities/platform-settings.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    @InjectRepository(PlatformSettings)
    private settingsRepo: Repository<PlatformSettings>,
    private notificationsService: NotificationsService,
  ) {
    const secretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
  }

  private ensureStripe() {
    if (!this.stripe) {
      throw new HttpException(
        'Payments not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // Returns commission rate as a fraction (e.g. 20 -> 0.20). Defaults to 0.20 if no settings row exists.
  private async getCommissionRate(): Promise<number> {
    const settings = await this.settingsRepo.findOne({ where: {} });
    if (!settings) return 0.20;
    return parseFloat(String(settings.commissionRate)) / 100;
  }

  // --- Connect (Companion onboarding) ---

  async createConnectAccount(userId: string, platform?: string): Promise<{ url: string }> {
    this.ensureStripe();
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    let accountId = user.stripeAccountId;

    if (!accountId) {
      const account = await this.stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: { userId: user.id },
      });
      accountId = account.id;
      await this.usersRepo.update(userId, { stripeAccountId: accountId });
    }

    const isNative = platform === 'native';
    const webBase = this.configService.get('APP_URL', 'https://daterabbit.smartlaunchhub.com');
    const refreshUrl = isNative ? 'daterabbit://stripe/refresh' : `${webBase}/stripe/refresh`;
    const returnUrl = isNative ? 'daterabbit://stripe/return' : `${webBase}/stripe/return`;

    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }

  async getConnectStatus(userId: string): Promise<{
    complete: boolean;
    payoutsEnabled: boolean;
  }> {
    this.ensureStripe();
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.stripeAccountId) {
      return { complete: false, payoutsEnabled: false };
    }

    const account = await this.stripe.accounts.retrieve(user.stripeAccountId);
    const complete = account.details_submitted ?? false;
    const payoutsEnabled = account.payouts_enabled ?? false;

    if (complete && !user.stripeOnboardingComplete) {
      await this.usersRepo.update(userId, { stripeOnboardingComplete: true });
    }

    return { complete, payoutsEnabled };
  }

  // --- Payment Intents (Seeker pays for booking) ---

  async createPaymentIntent(
    userId: string,
    bookingId: string,
  ): Promise<{
    clientSecret: string;
    feeBreakdown: {
      subtotal: number;
      platformFee: number;
      stripeFee: number;
      totalCharged: number;
    };
  }> {
    this.ensureStripe();

    const booking = await this.bookingsRepo.findOne({
      where: { id: bookingId },
      relations: ['companion'],
    });

    if (!booking)
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId)
      throw new HttpException('Not your booking', HttpStatus.FORBIDDEN);
    if (booking.status !== BookingStatus.CONFIRMED)
      throw new HttpException('Booking must be confirmed first', HttpStatus.BAD_REQUEST);

    const subtotal = Math.round(Number(booking.totalPrice) * 100) / 100; // dollars, 2dp
    const commissionRate = await this.getCommissionRate();
    const platformFeeAmount = Math.round(subtotal * commissionRate * 100) / 100;
    const stripeFee = Math.round(((subtotal + platformFeeAmount) * 0.029 + 0.30) * 100) / 100;
    const totalCharged = Math.round((subtotal + platformFeeAmount + stripeFee) * 100) / 100;

    const feeBreakdown = {
      subtotal,
      platformFee: platformFeeAmount,
      stripeFee,
      totalCharged,
    };

    // Idempotency: return existing payment intent if one already exists and is still active
    if (booking.paymentIntentId) {
      const existingIntent = await this.stripe.paymentIntents.retrieve(booking.paymentIntentId);
      if (
        existingIntent.status === 'requires_payment_method' ||
        existingIntent.status === 'requires_confirmation' ||
        existingIntent.status === 'requires_action'
      ) {
        return { clientSecret: existingIntent.client_secret!, feeBreakdown };
      }
      // Intent is cancelled/failed — clear it and create a new one
      await this.bookingsRepo.update(bookingId, { paymentIntentId: null as any });
    }

    const companion = await this.usersRepo.findOne({
      where: { id: booking.companionId },
    });
    if (!companion?.stripeAccountId) {
      throw new HttpException(
        'Companion has not set up payments',
        HttpStatus.BAD_REQUEST,
      );
    }

    const totalChargedCents = Math.round(totalCharged * 100);
    if (totalChargedCents <= 0) {
      throw new HttpException(
        'Booking total price must be greater than zero',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    // Platform fee applied on the subtotal only (companion gets subtotal minus platform fee)
    const platformFeeCents = Math.round(platformFeeAmount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: totalChargedCents,
      currency: 'usd',
      capture_method: 'manual',
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: companion.stripeAccountId,
      },
      metadata: {
        bookingId: booking.id,
        seekerId: userId,
        companionId: booking.companionId,
      },
    }, { idempotencyKey: bookingId });

    await this.bookingsRepo.update(bookingId, {
      paymentIntentId: paymentIntent.id,
    });

    return { clientSecret: paymentIntent.client_secret!, feeBreakdown };
  }

  // --- Capture / Cancel (escrow) ---

  async capturePayment(bookingId: string): Promise<void> {
    const booking = await this.bookingsRepo.findOne({ where: { id: bookingId } });
    if (!booking?.paymentIntentId) return;
    this.ensureStripe();
    try {
      await this.stripe.paymentIntents.capture(booking.paymentIntentId);
    } catch (err: any) {
      // already captured or cancelled — log but don't throw
      console.error('Stripe capture error:', err.message);
    }
  }

  async cancelPaymentHold(bookingId: string): Promise<void> {
    const booking = await this.bookingsRepo.findOne({ where: { id: bookingId } });
    if (!booking?.paymentIntentId) return;
    this.ensureStripe();
    try {
      const pi = await this.stripe.paymentIntents.retrieve(booking.paymentIntentId);
      if (pi.status === 'requires_capture') {
        // Cancel the hold (no charge)
        await this.stripe.paymentIntents.cancel(booking.paymentIntentId);
      } else if (pi.status === 'succeeded') {
        // Already captured — create refund
        await this.stripe.refunds.create({ payment_intent: booking.paymentIntentId });
      }
      // other statuses (canceled, etc.) — do nothing
    } catch (err: any) {
      console.error('Stripe cancel/refund error:', err.message);
    }
  }

  // --- Tiered refund policy ---

  /**
   * Calculate refund percentage based on who cancelled and how far in advance.
   * Rules:
   *   - Companion-initiated cancel → always 100% refund to seeker
   *   - 48+ hours before date → 100% refund
   *   - 24–48 hours before date → 50% refund
   *   - < 24 hours before date → 0% refund
   */
  calculateRefundPercent(booking: Booking, cancelledByUserId: string): number {
    // Companion-first rule: companion cancels → seeker always gets full refund
    if (cancelledByUserId === booking.companionId) {
      return 100;
    }

    const now = new Date();
    const dateTime = new Date(booking.dateTime);
    const hoursUntilDate = (dateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDate >= 48) return 100;
    if (hoursUntilDate >= 24) return 50;
    return 0;
  }

  /**
   * Execute tiered refund on Stripe based on refundPercent.
   * - 100%: cancel hold (if requires_capture) or full refund (if succeeded)
   * - 50%: capture first then partial refund (half amount)
   * - 0%: capture full amount (companion gets paid in full)
   * - No paymentIntentId (PENDING bookings): skip Stripe, no-op
   */
  async tieredRefund(bookingId: string, refundPercent: number): Promise<void> {
    const booking = await this.bookingsRepo.findOne({ where: { id: bookingId } });
    if (!booking?.paymentIntentId) return; // PENDING booking — no payment yet, nothing to do

    if (!this.stripe) return; // Stripe not configured

    try {
      const pi = await this.stripe.paymentIntents.retrieve(booking.paymentIntentId);
      const totalAmountCents = Math.round(Number(booking.totalPrice) * 100);

      if (refundPercent === 100) {
        if (pi.status === 'requires_capture') {
          // Cancel the hold — no charge at all
          await this.stripe.paymentIntents.cancel(booking.paymentIntentId);
        } else if (pi.status === 'succeeded') {
          // Already captured — full refund
          await this.stripe.refunds.create({ payment_intent: booking.paymentIntentId });
        }
      } else if (refundPercent === 50) {
        // 50% refund: seeker gets half back, companion keeps half
        const refundAmountCents = Math.round(totalAmountCents * 0.5);
        if (pi.status === 'requires_capture') {
          // Must capture first, then refund 50%
          await this.stripe.paymentIntents.capture(booking.paymentIntentId);
          if (refundAmountCents >= 50) {
            await this.stripe.refunds.create({
              payment_intent: booking.paymentIntentId,
              amount: refundAmountCents,
            });
          }
        } else if (pi.status === 'succeeded') {
          if (refundAmountCents >= 50) {
            await this.stripe.refunds.create({
              payment_intent: booking.paymentIntentId,
              amount: refundAmountCents,
            });
          }
        }
      } else {
        // 0% refund: companion gets full payment — capture the hold
        if (pi.status === 'requires_capture') {
          await this.stripe.paymentIntents.capture(booking.paymentIntentId);
        }
        // If already succeeded, nothing to do
      }
    } catch (err: any) {
      console.error(`[TIERED_REFUND] Stripe error for booking ${bookingId}:`, err.message);
    }
  }

  // --- Proportional capture for date completion ---

  async captureProportional(
    bookingId: string,
    actualHours: number,
  ): Promise<{ captured: number; refunded: number }> {
    const booking = await this.bookingsRepo.findOne({ where: { id: bookingId } });
    if (!booking?.paymentIntentId) return { captured: 0, refunded: 0 };

    const totalPrice = Number(booking.totalPrice);
    const bookedDuration = Number(booking.duration);

    if (actualHours >= bookedDuration) {
      // Full capture — no refund needed
      await this.capturePayment(bookingId);
      return { captured: totalPrice, refunded: 0 };
    }

    // Capture full amount first, then refund proportional unused time
    await this.capturePayment(bookingId);
    const refundFraction = 1 - actualHours / bookedDuration;
    const refundAmount = Math.round(totalPrice * refundFraction * 100) / 100;
    await this.partialRefundForEndEarly(bookingId, actualHours);
    return { captured: Math.round((totalPrice - refundAmount) * 100) / 100, refunded: refundAmount };
  }

  // --- Partial refund for end-early ---

  async partialRefundForEndEarly(bookingId: string, actualHours: number): Promise<void> {
    const booking = await this.bookingsRepo.findOne({ where: { id: bookingId } });
    if (!booking?.paymentIntentId) return;

    const totalPrice = Number(booking.totalPrice);
    const bookedDuration = Number(booking.duration);

    // No refund if ended at or beyond booked duration
    if (actualHours >= bookedDuration) return;

    const refundFraction = 1 - actualHours / bookedDuration;
    const refundAmountCents = Math.round(totalPrice * refundFraction * 100);

    // Stripe minimum charge is 50 cents
    if (refundAmountCents < 50) return;

    if (!this.stripe) return; // Stripe not configured — skip silently

    try {
      const pi = await this.stripe.paymentIntents.retrieve(booking.paymentIntentId);
      if (pi.status === 'succeeded') {
        await this.stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
          amount: refundAmountCents,
        });
      }
      // requires_capture or other status — refund not applicable
    } catch (err: any) {
      console.error('Stripe partial refund error for end-early:', err.message);
    }
  }

  // --- Earnings ---

  async getEarnings(userId: string): Promise<{
    totalEarnings: number;
    pendingPayouts: number;
    completedBookings: number;
  }> {
    const caller = await this.usersRepo.findOne({ where: { id: userId } });
    if (!caller || caller.role !== UserRole.COMPANION) {
      throw new HttpException('Access restricted to companions', HttpStatus.FORBIDDEN);
    }

    const completedBookings = await this.bookingsRepo
      .createQueryBuilder('b')
      .where('b.companionId = :userId', { userId })
      .andWhere('b.status IN (:...statuses)', {
        statuses: [BookingStatus.PAID, BookingStatus.COMPLETED],
      })
      .getMany();

    const commissionRate = await this.getCommissionRate();
    const companionShare = 1 - commissionRate;
    const totalEarnings = completedBookings.reduce(
      (sum, b) => sum + Number(b.totalPrice) * companionShare,
      0,
    );

    let pendingPayouts = 0;
    try {
      const user = await this.usersRepo.findOne({ where: { id: userId } });
      if (user?.stripeAccountId && this.stripe) {
        const balance = await this.stripe.balance.retrieve({
          stripeAccount: user.stripeAccountId,
        });
        const pending =
          balance.pending.find((b) => b.currency === 'usd')?.amount ?? 0;
        pendingPayouts = pending / 100;
      }
    } catch {
      // Stripe not configured or account issue — return 0
    }

    return {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      pendingPayouts,
      completedBookings: completedBookings.length,
    };
  }

  async getEarningsHistory(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    transactions: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [bookings, total] = await this.bookingsRepo.findAndCount({
      where: [
        { companionId: userId, status: BookingStatus.PAID },
        { companionId: userId, status: BookingStatus.COMPLETED },
      ],
      relations: ['seeker'],
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const commissionRate = await this.getCommissionRate();
    const companionShare = 1 - commissionRate;
    const transactions = bookings.map((b) => ({
      id: b.id,
      type: 'earning' as const,
      amount: Math.round(Number(b.totalPrice) * companionShare * 100) / 100,
      status: 'completed' as const,
      description: `Booking with ${b.seeker?.name || 'Unknown'}`,
      seekerName: b.seeker?.name,
      activity: b.activity,
      createdAt: b.updatedAt,
    }));

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // --- Payouts ---

  async getPayoutBalance(userId: string): Promise<{
    available: number;
    pending: number;
    currency: string;
  }> {
    this.ensureStripe();
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.stripeAccountId) {
      return { available: 0, pending: 0, currency: 'usd' };
    }

    const balance = await this.stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    const available =
      balance.available.find((b) => b.currency === 'usd')?.amount ?? 0;
    const pending =
      balance.pending.find((b) => b.currency === 'usd')?.amount ?? 0;

    return {
      available: available / 100,
      pending: pending / 100,
      currency: 'usd',
    };
  }

  async createPayout(
    userId: string,
    amount?: number,
  ): Promise<{
    success: boolean;
    payoutId?: string;
    amount?: number;
    message: string;
  }> {
    this.ensureStripe();
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.stripeAccountId) {
      throw new HttpException(
        'Payment account not set up',
        HttpStatus.BAD_REQUEST,
      );
    }

    const balance = await this.stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });
    const availableCents =
      balance.available.find((b) => b.currency === 'usd')?.amount ?? 0;

    const payoutCents = amount ? Math.round(amount * 100) : availableCents;

    if (payoutCents <= 0) {
      throw new HttpException(
        'Payout amount must be greater than zero',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (payoutCents < 100) {
      throw new HttpException(
        'Minimum payout amount is $1.00',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payoutCents > availableCents) {
      throw new HttpException(
        'Payout amount exceeds available balance',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const payout = await this.stripe.payouts.create(
      { amount: payoutCents, currency: 'usd' },
      { stripeAccount: user.stripeAccountId },
    );

    // Event 5: Notify companion that payout was processed (fire-and-forget)
    this.notificationsService.create({
      userId,
      type: NotificationType.PAYOUT_PROCESSED,
      title: 'Payout Initiated',
      body: `Your payout of $${(payoutCents / 100).toFixed(2)} has been initiated and is on its way.`,
      data: { payoutId: payout.id, amount: payoutCents / 100 },
      pushToken: user.expoPushToken,
      notificationPreferences: user.notificationPreferences,
      notificationsEnabled: user.notificationsEnabled,
    }).catch(() => undefined);

    return {
      success: true,
      payoutId: payout.id,
      amount: payoutCents / 100,
      message: 'Payout initiated',
    };
  }

  async getPayoutHistory(
    userId: string,
    limit = 10,
  ): Promise<{
    payouts: {
      id: string;
      amount: number;
      status: string;
      arrivalDate: string;
      createdAt: string;
    }[];
  }> {
    this.ensureStripe();
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.stripeAccountId) {
      return { payouts: [] };
    }

    const payouts = await this.stripe.payouts.list(
      { limit },
      { stripeAccount: user.stripeAccountId },
    );

    return {
      payouts: payouts.data.map((p) => ({
        id: p.id,
        amount: p.amount / 100,
        status: p.status,
        arrivalDate: new Date(p.arrival_date * 1000).toISOString(),
        createdAt: new Date(p.created * 1000).toISOString(),
      })),
    };
  }

  // --- Payment Methods (saved cards via SetupIntent) ---

  private async getOrCreateStripeCustomer(userId: string): Promise<string> {
    this.ensureStripe();
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });

    await this.usersRepo.update(userId, { stripeCustomerId: customer.id });
    return customer.id;
  }

  async createSetupIntent(userId: string): Promise<{ clientSecret: string }> {
    this.ensureStripe();
    const customerId = await this.getOrCreateStripeCustomer(userId);

    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    return { clientSecret: setupIntent.client_secret! };
  }

  async listPaymentMethods(userId: string): Promise<{
    paymentMethods: {
      id: string;
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    }[];
  }> {
    this.ensureStripe();
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.stripeCustomerId) {
      return { paymentMethods: [] };
    }

    const pms = await this.stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    return {
      paymentMethods: pms.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand ?? 'unknown',
        last4: pm.card?.last4 ?? '****',
        expMonth: pm.card?.exp_month ?? 0,
        expYear: pm.card?.exp_year ?? 0,
      })),
    };
  }

  async deletePaymentMethod(
    userId: string,
    paymentMethodId: string,
  ): Promise<{ success: boolean }> {
    this.ensureStripe();
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.stripeCustomerId) {
      throw new HttpException('No payment account found', HttpStatus.NOT_FOUND);
    }

    // Verify ownership: PM must belong to this user's customer (IDOR protection)
    const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== user.stripeCustomerId) {
      throw new HttpException('Payment method not found', HttpStatus.NOT_FOUND);
    }

    await this.stripe.paymentMethods.detach(paymentMethodId);
    return { success: true };
  }

  // --- Webhooks ---

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    this.ensureStripe();
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) return;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch {
      throw new HttpException('Invalid webhook signature', HttpStatus.BAD_REQUEST);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata.bookingId;
        if (bookingId) {
          const booking = await this.bookingsRepo.findOne({ where: { id: bookingId } });
          // Verify this payment intent actually belongs to this booking (IDOR protection)
          if (booking && booking.paymentIntentId === pi.id) {
            await this.bookingsRepo.update(bookingId, {
              status: BookingStatus.PAID,
            });
          }
        }
        break;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        if (account.details_submitted) {
          await this.usersRepo.update(
            { stripeAccountId: account.id },
            { stripeOnboardingComplete: true },
          );
        }
        break;
      }
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        // dispute.payment_intent can be a string ID or an expanded PaymentIntent object
        const paymentIntentId =
          typeof dispute.payment_intent === 'string'
            ? dispute.payment_intent
            : dispute.payment_intent?.id ?? null;

        if (paymentIntentId) {
          const booking = await this.bookingsRepo.findOne({
            where: { paymentIntentId },
          });
          // IDOR guard: only update if booking owns this payment intent
          if (booking && booking.paymentIntentId === paymentIntentId) {
            await this.bookingsRepo.update(booking.id, {
              status: BookingStatus.DISPUTED,
            });
            console.warn(
              `[DISPUTE] Stripe dispute opened — bookingId=${booking.id} disputeId=${dispute.id} ` +
              `amount=${dispute.amount} currency=${dispute.currency} reason=${dispute.reason ?? 'unknown'} ` +
              `seekerId=${booking.seekerId} companionId=${booking.companionId}`,
            );
          }
        }
        break;
      }
    }
  }
}
