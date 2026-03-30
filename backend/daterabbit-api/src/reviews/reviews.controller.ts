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
    @Param('bookingId') bookingId: string,
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

  @Get('users/:userId')
  async getReviewsForUser(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const { reviews, total } = await this.reviewsService.getReviewsForUser(
      userId,
      +page,
      +limit,
    );

    return {
      reviews: reviews.map((r) => ({
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
      total,
      page: +page,
      totalPages: Math.ceil(total / +limit),
    };
  }
}
