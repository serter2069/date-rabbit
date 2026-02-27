import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingStatus, ActivityType } from './entities/booking.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

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
  async getMyBookings(@Request() req) {
    // Get bookings as seeker
    const seekerBookings = await this.bookingsService.findByUser(req.user.id, 'seeker');
    // Get bookings as companion
    const companionBookings = await this.bookingsService.findByUser(req.user.id, 'companion');

    return {
      asSeeker: seekerBookings.map((b) => this.formatBooking(b)),
      asCompanion: companionBookings.map((b) => this.formatBooking(b)),
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

  @Get(':id')
  async getBooking(@Param('id') id: string, @Request() req) {
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
  async confirmBooking(@Param('id') id: string, @Request() req) {
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
    const updated = await this.bookingsService.updateStatus(id, BookingStatus.CONFIRMED);
    return this.formatBooking(updated);
  }

  @Put(':id/cancel')
  async cancelBooking(@Param('id') id: string, @Request() req, @Body() body: { reason?: string }) {
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
    return this.formatBooking(updated);
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
