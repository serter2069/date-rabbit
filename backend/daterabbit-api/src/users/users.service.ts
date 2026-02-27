import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, data);
    return this.findById(id);
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

  async getCompanions(filters: {
    priceMin?: number;
    priceMax?: number;
    maxDistance?: number;
    minRating?: number;
    ageMin?: number;
    ageMax?: number;
    sortBy?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ companions: User[]; total: number }> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.COMPANION })
      .andWhere('user.isActive = true');

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

    // Sort
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
      default:
        query.orderBy('user.createdAt', 'DESC');
    }

    const total = await query.getCount();
    const companions = await query
      .skip(filters.offset || 0)
      .take(Math.min(filters.limit || 20, 100))
      .getMany();

    return { companions, total };
  }
}
