import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post('bookings/:bookingId')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Request() req,
    @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.createReview(
      req.user.id,
      bookingId,
      dto.rating,
      dto.comment,
    );

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  async replyToReview(
    @Request() req,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ReplyReviewDto,
  ) {
    const review = await this.reviewsService.replyToReview(
      id,
      req.user.id,
      dto.text,
    );

    return {
      id: review.id,
      replyText: review.replyText,
      repliedAt: review.repliedAt,
    };
  }

  /**
   * GET /reviews/seeker-rating/:seekerId
   * Returns this companion's private rating of a specific seeker.
   * 403 if caller IS the seeker (seekers cannot see their own private rating).
   */
  @Get('seeker-rating/:seekerId')
  @UseGuards(JwtAuthGuard)
  async getSeekerPrivateRating(
    @Request() req,
    @Param('seekerId', new ParseUUIDPipe()) seekerId: string,
  ) {
    if (req.user.id === seekerId) {
      throw new ForbiddenException('Cannot view your own private rating');
    }
    return this.reviewsService.getSeekerPrivateRating(req.user.id, seekerId);
  }

  /**
   * GET /reviews/users/:userId
   * Privacy: when a seeker views their own reviews, hide companion->seeker reviews
   * (those are private and only visible to the companion who left them).
   */
  @Get('users/:userId')
  @UseGuards(JwtAuthGuard)
  async getReviewsForUser(
    @Request() req,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const { reviews, total } = await this.reviewsService.getReviewsForUser(
      userId,
      +page,
      +limit,
    );

    // If the caller is viewing their own reviews, filter out companion->seeker reviews
    // (private ratings that only the reviewing companion should see)
    const isOwnProfile = req.user.id === userId;
    const filtered = isOwnProfile
      ? reviews.filter((r) => r.reviewer?.role !== 'companion')
      : reviews;

    return {
      reviews: filtered.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        replyText: r.replyText ?? null,
        repliedAt: r.repliedAt ?? null,
        revieweeId: r.revieweeId,
        reviewer: r.reviewer
          ? { id: r.reviewer.id, name: r.reviewer.name }
          : undefined,
        createdAt: r.createdAt,
      })),
      total: filtered.length,
      page: +page,
      totalPages: Math.ceil(filtered.length / +limit),
    };
  }
}
