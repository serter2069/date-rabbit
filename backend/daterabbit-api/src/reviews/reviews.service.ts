import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepo: Repository<Review>,
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async createReview(
    reviewerId: string,
    bookingId: string,
    rating: number,
    comment?: string,
  ): Promise<Review> {
    const booking = await this.bookingsRepo.findOne({
      where: { id: bookingId },
      relations: ['seeker', 'companion'],
    });

    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new HttpException('Can only review completed bookings', HttpStatus.BAD_REQUEST);
    }

    // Determine who is being reviewed
    let revieweeId: string;
    if (booking.seekerId === reviewerId) {
      revieweeId = booking.companionId;
    } else if (booking.companionId === reviewerId) {
      revieweeId = booking.seekerId;
    } else {
      throw new HttpException('You are not part of this booking', HttpStatus.FORBIDDEN);
    }

    // Check for duplicate review
    const existing = await this.reviewsRepo.findOne({
      where: { reviewerId, bookingId },
    });
    if (existing) {
      throw new HttpException('You already reviewed this booking', HttpStatus.CONFLICT);
    }

    const review = this.reviewsRepo.create({
      reviewerId,
      revieweeId,
      bookingId,
      rating,
      comment,
    });

    const saved = await this.reviewsRepo.save(review);

    // Update reviewee's average rating
    await this.updateUserRating(revieweeId);

    return saved;
  }

  async getReviewsForUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.reviewsRepo.findAndCount({
      where: { revieweeId: userId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { reviews, total };
  }

  private async updateUserRating(userId: string): Promise<void> {
    const result = await this.reviewsRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('review.revieweeId = :userId', { userId })
      .getRawOne();

    await this.usersRepo.update(userId, {
      rating: parseFloat(result.avg) || 5.0,
      reviewCount: parseInt(result.count) || 0,
    });
  }
}
