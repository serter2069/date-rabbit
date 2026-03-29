import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { UserReport } from './entities/user-report.entity';
import { Favorite } from './entities/favorite.entity';
import { sanitizeText } from '../common/sanitize';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(BlockedUser)
    private blockedUsersRepository: Repository<BlockedUser>,
    @InjectRepository(UserReport)
    private userReportsRepository: Repository<UserReport>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // Find user including soft-deleted ones (used by JWT strategy to detect deactivated accounts)
  async findByIdWithDeleted(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id }, withDeleted: true });
  }

  async create(data: Partial<User>): Promise<User> {
    const referralCode = await this.generateUniqueReferralCode();
    const user = this.usersRepository.create({ ...data, referralCode });
    return this.usersRepository.save(user);
  }

  private async generateUniqueReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let attempt = 0; attempt < 3; attempt++) {
      let suffix = '';
      for (let i = 0; i < 5; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const code = `DR-${suffix}`;
      const existing = await this.usersRepository.findOne({ where: { referralCode: code } });
      if (!existing) {
        return code;
      }
    }
    // Extremely unlikely — return null and let it be generated later via referral endpoint
    return `DR-${Date.now().toString(36).slice(-5).toUpperCase()}`;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, data);
    return this.findById(id);
  }

  async updateLastSeen(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastSeen: new Date() });
  }

  async setOtp(userId: string, code: string, expiresAt: Date): Promise<void> {
    await this.usersRepository.update(userId, {
      otpCode: code,
      otpExpiresAt: expiresAt,
    });
  }

  async clearOtp(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      otpCode: undefined,
      otpExpiresAt: undefined,
    } as any);
  }

  async deactivateAccount(userId: string): Promise<void> {
    // Soft delete: set isActive=false and deletedAt timestamp via TypeORM softDelete
    await this.usersRepository.update(userId, {
      isActive: false,
    });
    await this.usersRepository.softDelete(userId);
  }

  async getCompanions(filters: {
    priceMin?: number;
    priceMax?: number;
    maxDistance?: number;
    latitude?: number;
    longitude?: number;
    minRating?: number;
    ageMin?: number;
    ageMax?: number;
    sortBy?: string;
    search?: string;
    limit?: number;
    offset?: number;
    excludeUserIds?: string[];
  }): Promise<{ companions: (User & { distance?: number })[]; total: number }> {
    const hasLocation = filters.latitude != null && filters.longitude != null;
    const distanceExpr = `(3959 * acos(LEAST(1.0, cos(radians(:lat)) * cos(radians("user"."latitude")) * cos(radians("user"."longitude") - radians(:lng)) + sin(radians(:lat)) * sin(radians("user"."latitude")))))`;

    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.COMPANION })
      .andWhere('user.isActive = true');

    if (hasLocation) {
      query.addSelect(distanceExpr, 'distance');
      query.setParameters({ lat: filters.latitude, lng: filters.longitude });
    }

    if (filters.excludeUserIds && filters.excludeUserIds.length > 0) {
      query.andWhere('user.id NOT IN (:...excludeIds)', { excludeIds: filters.excludeUserIds });
    }

    if (filters.priceMin) {
      query.andWhere('user.hourlyRate >= :priceMin', { priceMin: filters.priceMin });
    }
    if (filters.priceMax) {
      query.andWhere('user.hourlyRate <= :priceMax', { priceMax: filters.priceMax });
    }
    if (filters.minRating) {
      query.andWhere('user.rating >= :minRating', { minRating: filters.minRating });
    }
    if (filters.ageMin) {
      query.andWhere('user.age >= :ageMin', { ageMin: filters.ageMin });
    }
    if (filters.ageMax) {
      query.andWhere('user.age <= :ageMax', { ageMax: filters.ageMax });
    }
    if (filters.search) {
      query.andWhere('(user.name ILIKE :search OR user.location ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    if (hasLocation && filters.maxDistance) {
      query.andWhere('"user"."latitude" IS NOT NULL AND "user"."longitude" IS NOT NULL');
      query.andWhere(`${distanceExpr} <= :maxDist`, { maxDist: filters.maxDistance });
    }

    switch (filters.sortBy) {
      case 'price_low':
        query.orderBy('user.hourlyRate', 'ASC');
        break;
      case 'price_high':
        query.orderBy('user.hourlyRate', 'DESC');
        break;
      case 'rating':
        query.orderBy('user.rating', 'DESC');
        break;
      case 'distance':
        if (hasLocation) {
          query.andWhere('"user"."latitude" IS NOT NULL AND "user"."longitude" IS NOT NULL');
          query.orderBy('distance', 'ASC');
        } else {
          query.orderBy('user.createdAt', 'DESC');
        }
        break;
      case 'new': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query.andWhere('user.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo });
        query.andWhere('user.reviewCount < :newReviewThreshold', { newReviewThreshold: 5 });
        query.orderBy('user.createdAt', 'DESC');
        break;
      }
      default:
        query.orderBy('user.createdAt', 'DESC');
    }

    const total = await query.getCount();

    if (hasLocation) {
      const rawResults = await query
        .skip(filters.offset || 0)
        .take(Math.min(filters.limit || 20, 100))
        .getRawAndEntities();

      const companions = rawResults.entities.map((entity, i) => {
        const raw = rawResults.raw[i];
        return Object.assign(entity, {
          distance: raw?.distance != null ? parseFloat(raw.distance) : undefined,
        });
      });
      return { companions, total };
    }

    const companions = await query
      .skip(filters.offset || 0)
      .take(Math.min(filters.limit || 20, 100))
      .getMany();

    return { companions, total };
  }

  // --- Block / Unblock ---

  async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself');
    }

    const existing = await this.blockedUsersRepository.findOne({
      where: { blockerId, blockedId },
    });
    if (existing) {
      throw new ConflictException('User is already blocked');
    }

    const blocked = this.blockedUsersRepository.create({
      blockerId,
      blockedId,
      reason: reason ? sanitizeText(reason) : reason,
    });
    await this.blockedUsersRepository.save(blocked);
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await this.blockedUsersRepository.delete({ blockerId, blockedId });
  }

  async getBlockedUsers(userId: string): Promise<BlockedUser[]> {
    return this.blockedUsersRepository.find({
      where: { blockerId: userId },
      relations: ['blocked'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const blocked = await this.blockedUsersRepository.find({
      where: { blockerId: userId },
      select: ['blockedId'],
    });
    return blocked.map((b) => b.blockedId);
  }

  async isBlocked(userId: string, targetId: string): Promise<boolean> {
    const count = await this.blockedUsersRepository.count({
      where: { blockerId: userId, blockedId: targetId },
    });
    return count > 0;
  }

  // --- Report ---

  async reportUser(reporterId: string, reportedId: string, reason: string, description?: string): Promise<UserReport> {
    if (reporterId === reportedId) {
      throw new BadRequestException('You cannot report yourself');
    }

    const report = this.userReportsRepository.create({
      reporterId,
      reportedId,
      reason: sanitizeText(reason),
      description: description ? sanitizeText(description) : description,
    });
    return this.userReportsRepository.save(report);
  }

  // --- Favorites ---

  async getFavorites(userId: string): Promise<string[]> {
    const favorites = await this.favoritesRepository.find({
      where: { userId },
      select: ['companionId'],
      order: { createdAt: 'DESC' },
    });
    return favorites.map((f) => f.companionId);
  }

  async addFavorite(userId: string, companionId: string): Promise<void> {
    if (userId === companionId) {
      throw new BadRequestException('You cannot favorite yourself');
    }

    const existing = await this.favoritesRepository.findOne({
      where: { userId, companionId },
    });
    if (existing) {
      return; // Already favorited, idempotent
    }

    const favorite = this.favoritesRepository.create({ userId, companionId });
    await this.favoritesRepository.save(favorite);
  }

  async removeFavorite(userId: string, companionId: string): Promise<void> {
    await this.favoritesRepository.delete({ userId, companionId });
  }
}
