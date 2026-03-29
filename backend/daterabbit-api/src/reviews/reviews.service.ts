import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { sanitizeText } from '../common/sanitize';

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
      comment: comment ? sanitizeText(comment) : comment,
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
    try {
      const [reviews, total] = await this.reviewsRepo.findAndCount({
        where: { revieweeId: userId },
        relations: ['reviewer'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return { reviews, total };
    } catch {
      // Return empty result if query fails (e.g. user not found)
      return { reviews: [], total: 0 };
    }
  }

  /**
   * Get a companion's private rating of a specific seeker.
   * Returns only reviews where this companion reviewed this seeker.
   */
  async getSeekerPrivateRating(
    companionId: string,
    seekerId: string,
  ): Promise<{ average: number; count: number }> {
    const result = await this.reviewsRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('review.reviewerId = :companionId', { companionId })
      .andWhere('review.revieweeId = :seekerId', { seekerId })
      .getRawOne();

    return {
      average: parseFloat(result.avg) || 0,
      count: parseInt(result.count) || 0,
    };
  }

  /**
   * Batch-query companion's private ratings for multiple seekers.
   * Returns a map of seekerId -> { average, count }.
   */
  async getSeekerPrivateRatingsBatch(
    companionId: string,
    seekerIds: string[],
  ): Promise<Map<string, { average: number; count: number }>> {
    const map = new Map<string, { average: number; count: number }>();
    if (seekerIds.length === 0) return map;

    const results = await this.reviewsRepo
      .createQueryBuilder('review')
      .select('review.revieweeId', 'seekerId')
      .addSelect('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('review.reviewerId = :companionId', { companionId })
      .andWhere('review.revieweeId IN (:...seekerIds)', { seekerIds })
      .groupBy('review.revieweeId')
      .getRawMany();

    for (const row of results) {
      map.set(row.seekerId, {
        average: parseFloat(row.avg) || 0,
        count: parseInt(row.count) || 0,
      });
    }

    return map;
  }

  private async updateUserRating(userId: string): Promise<void> {
    const result = await this.reviewsRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('review.revieweeId = :userId', { userId })
      .getRawOne();

    await this.usersRepo.update(userId, {
      rating: parseFloat(result.avg) || 0,
      reviewCount: parseInt(result.count) || 0,
    });
  }
}
