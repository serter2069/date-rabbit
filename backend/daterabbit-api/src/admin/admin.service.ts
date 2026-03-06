import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Verification, VerificationStatus } from '../verification/entities/verification.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    @InjectRepository(Verification)
    private verificationsRepo: Repository<Verification>,
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
}
