import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Verification, VerificationStatus } from '../verification/entities/verification.entity';
import { Review } from '../reviews/entities/review.entity';
import { PlatformSettings } from './entities/platform-settings.entity';
import { CitiesService } from '../cities/cities.service';
import { CreateCityDto } from '../cities/dto/create-city.dto';
import { UpdateCityDto } from '../cities/dto/update-city.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    @InjectRepository(Verification)
    private verificationsRepo: Repository<Verification>,
    @InjectRepository(Review)
    private reviewsRepo: Repository<Review>,
    @InjectRepository(PlatformSettings)
    private settingsRepo: Repository<PlatformSettings>,
    private readonly citiesService: CitiesService,
  ) {}

  async getStats() {
    const [totalUsers, totalBookings, revenueResult] = await Promise.all([
      this.usersRepo.count(),
      this.bookingsRepo.count(),
      this.bookingsRepo
        .createQueryBuilder('b')
        .select('COALESCE(SUM(b.totalPrice), 0)', 'total')
        .where('b.status IN (:...statuses)', {
          statuses: [BookingStatus.PAID, BookingStatus.COMPLETED],
        })
        .getRawOne<{ total: string }>(),
    ]);

    return {
      totalUsers,
      totalBookings,
      revenue: parseFloat(revenueResult?.total ?? '0'),
    };
  }

  // #700 - revenue breakdown
  async getRevenue() {
    const [totalResult, monthResult, bookingCounts] = await Promise.all([
      this.bookingsRepo
        .createQueryBuilder('b')
        .select('COALESCE(SUM(b.totalPrice), 0)', 'total')
        .where('b.status IN (:...statuses)', {
          statuses: [BookingStatus.PAID, BookingStatus.COMPLETED],
        })
        .getRawOne<{ total: string }>(),
      this.bookingsRepo
        .createQueryBuilder('b')
        .select('COALESCE(SUM(b.totalPrice), 0)', 'total')
        .where('b.status IN (:...statuses)', {
          statuses: [BookingStatus.PAID, BookingStatus.COMPLETED],
        })
        .andWhere("b.createdAt >= date_trunc('month', NOW())")
        .getRawOne<{ total: string }>(),
      this.bookingsRepo
        .createQueryBuilder('b')
        .select('b.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('b.status')
        .getRawMany<{ status: string; count: string }>(),
    ]);

    const countsByStatus: Record<string, number> = {};
    for (const row of bookingCounts) {
      countsByStatus[row.status] = parseInt(row.count, 10);
    }

    return {
      totalRevenue: parseFloat(totalResult?.total ?? '0'),
      monthRevenue: parseFloat(monthResult?.total ?? '0'),
      bookingsByStatus: countsByStatus,
    };
  }

  // #700 - transactions (paid/completed bookings)
  async getTransactions(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.bookingsRepo.findAndCount({
      where: { status: In([BookingStatus.PAID, BookingStatus.COMPLETED]) },
      relations: ['seeker', 'companion'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }

  // #701 - reviews
  async getReviews(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.reviewsRepo.findAndCount({
      relations: ['reviewer', 'reviewee'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async deleteReview(id: string) {
    const review = await this.reviewsRepo.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await this.reviewsRepo.delete(id);
    return { success: true };
  }

  async getUsers(search: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where = search
      ? [{ email: ILike(`%${search}%`) }, { name: ILike(`%${search}%`) }]
      : {};

    const [items, total] = await this.usersRepo.findAndCount({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        verificationStatus: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async getUserById(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        age: true,
        location: true,
        bio: true,
        hourlyRate: true,
        rating: true,
        reviewCount: true,
        isVerified: true,
        verificationStatus: true,
        isActive: true,
        isAdmin: true,
        stripeOnboardingComplete: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, data: { isActive?: boolean; isAdmin?: boolean }) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepo.update(id, data);
    return this.getUserById(id);
  }

  // #697 - ban/unban
  async banUser(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isActive) {
      throw new BadRequestException('User is already banned');
    }
    await this.usersRepo.update(id, { isActive: false });
    return { success: true, userId: id, banned: true };
  }

  async unbanUser(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isActive) {
      throw new BadRequestException('User is not banned');
    }
    await this.usersRepo.update(id, { isActive: true });
    return { success: true, userId: id, banned: false };
  }

  // #698 - user bookings
  async getUserBookings(userId: string, page: number, limit: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.bookingsRepo.findAndCount({
      where: [{ seekerId: userId }, { companionId: userId }],
      relations: ['seeker', 'companion'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async getBookings(status: string | undefined, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as BookingStatus } : {};

    const [items, total] = await this.bookingsRepo.findAndCount({
      where,
      relations: ['seeker', 'companion'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async getBookingById(id: string) {
    const booking = await this.bookingsRepo.findOne({
      where: { id },
      relations: ['seeker', 'companion'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  // #699 - cancel booking
  async cancelBooking(id: string, reason?: string) {
    const booking = await this.bookingsRepo.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    await this.bookingsRepo.update(id, {
      status: BookingStatus.CANCELLED,
      cancellationReason: reason || 'Cancelled by admin',
    });

    return this.getBookingById(id);
  }

  async getVerifications(status: string | undefined, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as VerificationStatus } : {};

    const [items, total] = await this.verificationsRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async approveVerification(id: string) {
    const verification = await this.verificationsRepo.findOne({ where: { id } });
    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    await this.verificationsRepo.update(id, { status: VerificationStatus.APPROVED });
    await this.usersRepo.update(verification.userId, {
      isVerified: true,
      verificationStatus: 'approved' as any,
    });

    return { success: true };
  }

  async rejectVerification(id: string, reason?: string) {
    const verification = await this.verificationsRepo.findOne({ where: { id } });
    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    await this.verificationsRepo.update(id, {
      status: VerificationStatus.REJECTED,
      rejectionReason: reason || 'Rejected by admin',
    });
    await this.usersRepo.update(verification.userId, {
      isVerified: false,
      verificationStatus: 'rejected' as any,
    });

    return { success: true };
  }

  // #702 - platform settings
  private async getOrCreateSettings(): Promise<PlatformSettings> {
    let settings = await this.settingsRepo.findOne({ where: {} });
    if (!settings) {
      settings = this.settingsRepo.create({});
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async getSettings() {
    const settings = await this.getOrCreateSettings();
    return {
      commissionRate: parseFloat(String(settings.commissionRate)),
      minHourlyRate: parseFloat(String(settings.minHourlyRate)),
      maxHourlyRate: parseFloat(String(settings.maxHourlyRate)),
      requireVerification: settings.requireVerification,
      requirePhotoForCompanion: settings.requirePhotoForCompanion,
      minimumAge: settings.minimumAge,
    };
  }

  async updateSettings(data: Partial<{
    commissionRate: number;
    minHourlyRate: number;
    maxHourlyRate: number;
    requireVerification: boolean;
    requirePhotoForCompanion: boolean;
    minimumAge: number;
  }>) {
    const settings = await this.getOrCreateSettings();

    if (data.commissionRate !== undefined) {
      if (data.commissionRate < 0 || data.commissionRate > 100) {
        throw new BadRequestException('Commission rate must be between 0 and 100');
      }
      settings.commissionRate = data.commissionRate;
    }
    if (data.minHourlyRate !== undefined) {
      if (data.minHourlyRate < 0) {
        throw new BadRequestException('Min hourly rate cannot be negative');
      }
      settings.minHourlyRate = data.minHourlyRate;
    }
    if (data.maxHourlyRate !== undefined) {
      if (data.maxHourlyRate < 0) {
        throw new BadRequestException('Max hourly rate cannot be negative');
      }
      settings.maxHourlyRate = data.maxHourlyRate;
    }
    if (data.requireVerification !== undefined) {
      settings.requireVerification = data.requireVerification;
    }
    if (data.requirePhotoForCompanion !== undefined) {
      settings.requirePhotoForCompanion = data.requirePhotoForCompanion;
    }
    if (data.minimumAge !== undefined) {
      if (data.minimumAge < 18) {
        throw new BadRequestException('Minimum age cannot be less than 18');
      }
      settings.minimumAge = data.minimumAge;
    }

    await this.settingsRepo.save(settings);
    return this.getSettings();
  }

  // #2039 - cities management
  async getCities() {
    return this.citiesService.findAll(false);
  }

  async createCity(dto: CreateCityDto) {
    return this.citiesService.create(dto);
  }

  async updateCity(id: string, dto: UpdateCityDto) {
    return this.citiesService.update(id, dto);
  }
}
