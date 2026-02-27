import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
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
