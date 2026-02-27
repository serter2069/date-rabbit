import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User } from '../users/entities/user.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
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

  // --- Connect (Companion onboarding) ---

  async createConnectAccount(userId: string): Promise<{ url: string }> {
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

    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${this.configService.get('APP_URL', 'https://daterabbit.smartlaunchhub.com')}/stripe/refresh`,
      return_url: `${this.configService.get('APP_URL', 'https://daterabbit.smartlaunchhub.com')}/stripe/return`,
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
  ): Promise<{ clientSecret: string }> {
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

    const companion = await this.usersRepo.findOne({
      where: { id: booking.companionId },
    });
    if (!companion?.stripeAccountId) {
      throw new HttpException(
        'Companion has not set up payments',
        HttpStatus.BAD_REQUEST,
      );
    }

    const amount = Math.round(Number(booking.totalPrice) * 100); // cents
    const platformFee = Math.round(amount * 0.15); // 15% platform fee

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: companion.stripeAccountId,
      },
      metadata: {
        bookingId: booking.id,
        seekerId: userId,
        companionId: booking.companionId,
      },
    });

    await this.bookingsRepo.update(bookingId, {
      paymentIntentId: paymentIntent.id,
    });

    return { clientSecret: paymentIntent.client_secret! };
  }

  // --- Earnings ---

  async getEarnings(userId: string): Promise<{
    totalEarnings: number;
    pendingPayouts: number;
    completedBookings: number;
  }> {
    const completedBookings = await this.bookingsRepo
      .createQueryBuilder('b')
      .where('b.companionId = :userId', { userId })
      .andWhere('b.status IN (:...statuses)', {
        statuses: [BookingStatus.PAID, BookingStatus.COMPLETED],
      })
      .getMany();

    const totalEarnings = completedBookings.reduce(
      (sum, b) => sum + Number(b.totalPrice) * 0.85, // minus 15% platform fee
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

    const transactions = bookings.map((b) => ({
      id: b.id,
      type: 'earning' as const,
      amount: Math.round(Number(b.totalPrice) * 0.85 * 100) / 100,
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
      return { success: false, message: 'No available balance to pay out' };
    }
    if (payoutCents > availableCents) {
      return { success: false, message: 'Insufficient available balance' };
    }

    const payout = await this.stripe.payouts.create(
      { amount: payoutCents, currency: 'usd' },
      { stripeAccount: user.stripeAccountId },
    );

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
          await this.bookingsRepo.update(bookingId, {
            status: BookingStatus.PAID,
          });
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
    }
  }
}
