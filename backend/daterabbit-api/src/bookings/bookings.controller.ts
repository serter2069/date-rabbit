import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, HttpException, HttpStatus, ParseUUIDPipe, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookingsService } from './bookings.service';
import { PaymentsService } from '../payments/payments.service';
import { UploadsService } from '../uploads/uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingStatus, ActivityType } from './entities/booking.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private bookingsService: BookingsService,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
    private uploadsService: UploadsService,
  ) {}

  @Post()
  async createBooking(
    @Request() req,
    @Body() body: {
      companionId: string;
      dateTime: string;
      duration: number;
      activity: string;
      location?: string;
      notes?: string;
    },
  ) {
    if (!body.companionId || !body.dateTime || !body.duration || !body.activity) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }

    const validActivities = Object.values(ActivityType);
    if (!validActivities.includes(body.activity as ActivityType)) {
      throw new HttpException(
        `Invalid activity. Must be one of: ${validActivities.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (typeof body.duration !== 'number' || body.duration <= 0) {
      throw new HttpException('Duration must be a positive number', HttpStatus.BAD_REQUEST);
    }

    const dateTime = new Date(body.dateTime);
    if (isNaN(dateTime.getTime())) {
      throw new HttpException('Invalid dateTime format', HttpStatus.BAD_REQUEST);
    }
    if (dateTime < new Date()) {
      throw new HttpException('Cannot book in the past', HttpStatus.BAD_REQUEST);
    }

    if (body.companionId === req.user.id) {
      throw new HttpException('Cannot book yourself', HttpStatus.BAD_REQUEST);
    }

    if (body.notes && body.notes.length > 2000) {
      throw new HttpException('Notes too long (max 2000 characters)', HttpStatus.BAD_REQUEST);
    }

    const booking = await this.bookingsService.create({
      seekerId: req.user.id,
      companionId: body.companionId,
      dateTime,
      duration: body.duration,
      activity: body.activity as ActivityType,
      location: body.location,
      notes: body.notes,
    });

    return booking;
  }

  @Get()
  async getMyBookings(
    @Request() req,
    @Query('filter') filter: 'all' | 'upcoming' | 'pending' | 'past' = 'all',
    @Query('page') page = '1',
  ) {
    const validFilters = ['all', 'upcoming', 'pending', 'past'];
    const safeFilter = validFilters.includes(filter) ? filter : 'all';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    const { bookings, total } = await this.bookingsService.findByUserFiltered(
      req.user.id,
      safeFilter,
      pageNum,
    );

    return {
      bookings: bookings.map((b) => this.formatBooking(b)),
      total,
      page: pageNum,
      filter: safeFilter,
    };
  }

  @Get('upcoming')
  async getUpcoming(@Request() req) {
    const bookings = await this.bookingsService.getUpcoming(req.user.id);
    return bookings.map((b) => this.formatBooking(b));
  }

  @Get('requests')
  async getPendingRequests(@Request() req) {
    const requests = await this.bookingsService.getPendingRequests(req.user.id);
    return requests.map((b) => this.formatBooking(b));
  }

  @Get('active')
  async getActiveDateBooking(@Request() req) {
    const booking = await this.bookingsService.getActiveDateBooking(req.user.id);
    if (!booking) return null;
    return this.formatBooking(booking);
  }

  /**
   * UC-050: Get booking status for request_sent polling screen.
   * Returns status, companion info, and elapsed time since request was sent.
   */
  @Get(':id/status')
  async getBookingStatus(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }
    if (booking.seekerId !== req.user.id && booking.companionId !== req.user.id) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    const now = new Date();
    const createdAt = new Date(booking.createdAt);
    const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

    return {
      id: booking.id,
      status: booking.status,
      elapsedSeconds,
      createdAt: booking.createdAt,
      companion: booking.companion ? {
        id: booking.companion.id,
        name: booking.companion.name,
        photos: booking.companion.photos,
      } : undefined,
      cancellationReason: booking.cancellationReason || undefined,
    };
  }

  @Get(':id')
  async getBooking(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }
    if (booking.seekerId !== req.user.id && booking.companionId !== req.user.id) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    return this.formatBooking(booking);
  }

  @Put(':id/confirm')
  async confirmBooking(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }
    if (booking.companionId !== req.user.id) {
      throw new HttpException('Only companion can confirm', HttpStatus.FORBIDDEN);
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new HttpException(
        `Cannot confirm a ${booking.status} booking`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const updated = await this.bookingsService.confirm(id);
    return this.formatBooking(updated);
  }

  @Put(':id/cancel')
  async cancelBooking(@Param('id', ParseUUIDPipe) id: string, @Request() req, @Body() body: { reason?: string }) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }
    if (booking.seekerId !== req.user.id && booking.companionId !== req.user.id) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new HttpException('Booking is already cancelled', HttpStatus.BAD_REQUEST);
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new HttpException('Cannot cancel a completed booking', HttpStatus.BAD_REQUEST);
    }
    const updated = await this.bookingsService.updateStatus(id, BookingStatus.CANCELLED, body.reason);
    // Release Stripe hold or refund (fire-and-forget, don't fail the cancel if Stripe fails)
    this.paymentsService.cancelPaymentHold(id).catch(err =>
      console.error('Stripe cancel error for booking', id, err),
    );

    // UC-051: Notify the other party about cancellation
    const isCompanionCancelling = booking.companionId === req.user.id;
    if (isCompanionCancelling) {
      // Companion declined -> notify seeker
      await this.notificationsService.create({
        userId: booking.seekerId,
        type: NotificationType.BOOKING_DECLINED,
        title: 'Booking Declined',
        body: `${booking.companion?.name || 'The companion'} has declined your booking request.${body.reason ? ` Reason: ${body.reason}` : ''}`,
        data: {
          bookingId: booking.id,
          companionId: booking.companionId,
          companionName: booking.companion?.name,
          reason: body.reason,
        },
      });
    } else {
      // Seeker cancelled -> notify companion
      await this.notificationsService.create({
        userId: booking.companionId,
        type: NotificationType.BOOKING_CANCELLED,
        title: 'Booking Cancelled',
        body: `${booking.seeker?.name || 'The seeker'} has cancelled the booking.${body.reason ? ` Reason: ${body.reason}` : ''}`,
        data: {
          bookingId: booking.id,
          seekerId: booking.seekerId,
          seekerName: booking.seeker?.name,
          reason: body.reason,
        },
      });
    }

    return this.formatBooking(updated);
  }

  @Put(':id/complete')
  async completeBooking(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const updated = await this.bookingsService.complete(id, req.user.id);
    // Capture the Stripe hold (fire-and-forget)
    this.paymentsService.capturePayment(id).catch(err =>
      console.error('Stripe capture error for booking', id, err),
    );
    return this.formatBooking(updated);
  }

  @Post(':id/checkin')
  async seekerCheckin(@Param('id', ParseUUIDPipe) id: string, @Request() req, @Body() body: { lat?: number; lon?: number }) {
    const booking = await this.bookingsService.seekerCheckin(id, req.user.id, body.lat, body.lon);
    return this.formatBooking(booking);
  }

  @Post(':id/companion-checkin')
  async companionCheckin(@Param('id', ParseUUIDPipe) id: string, @Request() req, @Body() body: { lat?: number; lon?: number }) {
    const booking = await this.bookingsService.companionCheckin(id, req.user.id, body.lat, body.lon);
    return this.formatBooking(booking);
  }

  @Post(':id/sos')
  async triggerSOS(@Param('id', ParseUUIDPipe) id: string, @Request() req, @Body() body: { lat?: number; lon?: number }) {
    const booking = await this.bookingsService.triggerSOS(id, req.user.id, body.lat, body.lon);
    return this.formatBooking(booking);
  }

  @Post(':id/end-early')
  async endEarly(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const booking = await this.bookingsService.endEarly(id, req.user.id);
    // Proportional refund for unused time (fire-and-forget)
    this.paymentsService.partialRefundForEndEarly(id, Number(booking.actualDurationHours ?? booking.duration)).catch(err =>
      console.error('Partial refund error for booking', id, err),
    );
    return this.formatBooking(booking);
  }

  // --- Group 1: Safety check-in ---

  @Post(':id/safety-checkin')
  async safetyCheckin(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const booking = await this.bookingsService.safetyCheckin(id, req.user.id);
    return this.formatBooking(booking);
  }

  // --- Group 1: Photos ---

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    this.uploadsService.validateImageFile(file);
    const url = await this.uploadsService.uploadFile(file, 'date-photos');
    return this.bookingsService.addPhoto(id, req.user.id, url);
  }

  @Get(':id/photos')
  async getPhotos(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const photos = await this.bookingsService.getPhotos(id, req.user.id);
    return { photos };
  }

  // --- Group 1: Date plan ---

  @Get(':id/plan')
  async getDatePlan(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const plan = await this.bookingsService.getDatePlan(id, req.user.id);
    return plan || { places: [] };
  }

  @Put(':id/plan')
  async updateDatePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { plan: Record<string, any> },
  ) {
    if (!body.plan) {
      throw new HttpException('Plan data is required', HttpStatus.BAD_REQUEST);
    }
    const booking = await this.bookingsService.updateDatePlan(id, req.user.id, body.plan);
    return this.formatBooking(booking);
  }

  // --- Group 1: Report issue ---

  @Post(':id/report-issue')
  async reportIssue(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { type: string; text: string },
  ) {
    if (!body.type || !body.text) {
      throw new HttpException('Issue type and text are required', HttpStatus.BAD_REQUEST);
    }
    const validTypes = ['safety', 'behavior', 'scam', 'other'];
    if (!validTypes.includes(body.type)) {
      throw new HttpException(
        `Invalid issue type. Must be one of: ${validTypes.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const booking = await this.bookingsService.reportIssue(id, req.user.id, body.type, body.text);
    return this.formatBooking(booking);
  }

  // --- Group 1: Extend request ---

  @Post(':id/extend-request')
  async extendRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { hours: number },
  ) {
    if (!body.hours || typeof body.hours !== 'number') {
      throw new HttpException('Hours is required and must be a number', HttpStatus.BAD_REQUEST);
    }
    const booking = await this.bookingsService.requestExtend(id, req.user.id, body.hours);
    return this.formatBooking(booking);
  }

  // --- UC-061: Selfie verification ---

  /**
   * Multipart upload: POST /bookings/:id/verify-selfie/upload
   * Accepts `file` (image), saves to uploads/selfies/, then records selfie verification.
   */
  @Post(':id/verify-selfie/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSelfieFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    this.uploadsService.validateImageFile(file);
    const photoUrl = await this.uploadsService.uploadFile(file, 'selfies');
    return this.bookingsService.submitSelfie(id, req.user.id, photoUrl);
  }

  @Post(':id/verify-selfie')
  async submitSelfie(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { photoUrl: string },
  ) {
    if (!body.photoUrl) {
      throw new HttpException('photoUrl is required', HttpStatus.BAD_REQUEST);
    }
    return this.bookingsService.submitSelfie(id, req.user.id, body.photoUrl);
  }

  @Get(':id/verify-selfie')
  async getSelfieStatus(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.bookingsService.getSelfieStatus(id, req.user.id);
  }

  // --- Group 2: Extend response ---

  @Put(':id/extend-response')
  async extendResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { approved: boolean },
  ) {
    if (typeof body.approved !== 'boolean') {
      throw new HttpException('approved (boolean) is required', HttpStatus.BAD_REQUEST);
    }
    const booking = await this.bookingsService.respondExtend(id, req.user.id, body.approved);
    return this.formatBooking(booking);
  }

  private formatBooking(booking: any) {
    return {
      id: booking.id,
      dateTime: booking.dateTime,
      duration: booking.duration,
      activity: booking.activity,
      location: booking.location,
      notes: booking.notes,
      totalPrice: booking.totalPrice,
      status: booking.status,
      cancellationReason: booking.cancellationReason || undefined,
      seekerCheckinAt: booking.seekerCheckinAt || undefined,
      companionCheckinAt: booking.companionCheckinAt || undefined,
      activeDateStartedAt: booking.activeDateStartedAt || undefined,
      activeDateEndedAt: booking.activeDateEndedAt || undefined,
      actualDurationHours: booking.actualDurationHours || undefined,
      sosTriggeredAt: booking.sosTriggeredAt || undefined,
      sosTriggeredBy: booking.sosTriggeredBy || undefined,
      noShowReason: booking.noShowReason || undefined,
      datePlan: booking.datePlan || undefined,
      safetyCheckinAt: booking.safetyCheckinAt || undefined,
      extendRequestedHours: booking.extendRequestedHours || undefined,
      extendRequestedAt: booking.extendRequestedAt || undefined,
      extendApproved: booking.extendApproved !== null && booking.extendApproved !== undefined ? booking.extendApproved : undefined,
      reportIssueType: booking.reportIssueType || undefined,
      reportIssueText: booking.reportIssueText || undefined,
      selfieVerified: booking.selfieVerified || false,
      seeker: booking.seeker ? {
        id: booking.seeker.id,
        name: booking.seeker.name,
        photos: booking.seeker.photos,
      } : undefined,
      companion: booking.companion ? {
        id: booking.companion.id,
        name: booking.companion.name,
        photos: booking.companion.photos,
        hourlyRate: booking.companion.hourlyRate,
      } : undefined,
      createdAt: booking.createdAt,
    };
  }
}
