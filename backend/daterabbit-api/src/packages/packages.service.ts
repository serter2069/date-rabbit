import { Injectable, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatePackageTemplate } from './entities/date-package-template.entity';
import { DatePackage } from './entities/date-package.entity';
import { ActivityType } from '../bookings/entities/booking.entity';

const SEED_TEMPLATES = [
  {
    slug: 'coffee-date',
    name: 'Coffee Date',
    nameRu: 'Кофе-свидание',
    description: 'A relaxed coffee meetup — perfect for a first date or casual conversation.',
    descriptionRu: 'Расслабленная встреча за кофе — идеально для первого свидания или непринуждённой беседы.',
    defaultDuration: 2,
    defaultActivity: ActivityType.COFFEE,
    icon: 'coffee',
    order: 1,
  },
  {
    slug: 'evening-dinner',
    name: 'Evening + Dinner',
    nameRu: 'Вечер + Ужин',
    description: 'An elegant evening out with dinner — great for a special night.',
    descriptionRu: 'Элегантный вечер с ужином — отличный выбор для особого вечера.',
    defaultDuration: 4,
    defaultActivity: ActivityType.DINNER,
    icon: 'utensils',
    order: 2,
  },
  {
    slug: 'full-day',
    name: 'Full Day Adventure',
    nameRu: 'Приключение на весь день',
    description: 'A full-day experience — explore the city, visit museums, enjoy meals together.',
    descriptionRu: 'Впечатления на весь день — прогулки по городу, музеи, совместные трапезы.',
    defaultDuration: 8,
    defaultActivity: ActivityType.WALK,
    icon: 'sun',
    order: 3,
  },
];

@Injectable()
export class PackagesService implements OnModuleInit {
  constructor(
    @InjectRepository(DatePackageTemplate)
    private templatesRepository: Repository<DatePackageTemplate>,
    @InjectRepository(DatePackage)
    private packagesRepository: Repository<DatePackage>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const seed of SEED_TEMPLATES) {
      const existing = await this.templatesRepository.findOne({
        where: { slug: seed.slug },
      });
      if (existing) {
        await this.templatesRepository.update(existing.id, seed);
      } else {
        await this.templatesRepository.save(this.templatesRepository.create(seed));
      }
    }
  }

  async getTemplates(): Promise<DatePackageTemplate[]> {
    return this.templatesRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  async getCompanionPackages(companionId: string): Promise<DatePackage[]> {
    return this.packagesRepository.find({
      where: { companionId, isActive: true },
      relations: ['template'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyPackages(userId: string): Promise<DatePackage[]> {
    return this.packagesRepository.find({
      where: { companionId: userId },
      relations: ['template'],
      order: { createdAt: 'DESC' },
    });
  }

  async createPackage(data: {
    companionId: string;
    templateId: string;
    price: number;
    customDescription?: string;
  }): Promise<DatePackage> {
    const template = await this.templatesRepository.findOne({
      where: { id: data.templateId, isActive: true },
    });
    if (!template) {
      throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
    }

    if (typeof data.price !== 'number' || data.price <= 0) {
      throw new HttpException('Price must be a positive number', HttpStatus.BAD_REQUEST);
    }

    // Check if companion already has a package for this template
    const existing = await this.packagesRepository.findOne({
      where: { companionId: data.companionId, templateId: data.templateId },
    });
    if (existing) {
      throw new HttpException(
        'You already have a package for this template. Update or delete it first.',
        HttpStatus.CONFLICT,
      );
    }

    const pkg = this.packagesRepository.create({
      companionId: data.companionId,
      templateId: data.templateId,
      price: data.price,
      customDescription: data.customDescription || null,
    });
    const saved = await this.packagesRepository.save(pkg);
    return this.packagesRepository.findOne({
      where: { id: saved.id },
      relations: ['template'],
    }) as Promise<DatePackage>;
  }

  async updatePackage(
    packageId: string,
    userId: string,
    data: { price?: number; customDescription?: string; isActive?: boolean },
  ): Promise<DatePackage> {
    const pkg = await this.packagesRepository.findOne({
      where: { id: packageId },
      relations: ['template'],
    });
    if (!pkg) {
      throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
    }
    if (pkg.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    if (data.price !== undefined) {
      if (typeof data.price !== 'number' || data.price <= 0) {
        throw new HttpException('Price must be a positive number', HttpStatus.BAD_REQUEST);
      }
      pkg.price = data.price;
    }
    if (data.customDescription !== undefined) {
      pkg.customDescription = data.customDescription || null;
    }
    if (data.isActive !== undefined) {
      pkg.isActive = data.isActive;
    }

    await this.packagesRepository.save(pkg);
    return this.packagesRepository.findOne({
      where: { id: packageId },
      relations: ['template'],
    }) as Promise<DatePackage>;
  }

  async deletePackage(packageId: string, userId: string): Promise<void> {
    const pkg = await this.packagesRepository.findOne({
      where: { id: packageId },
    });
    if (!pkg) {
      throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
    }
    if (pkg.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    await this.packagesRepository.remove(pkg);
  }

  async findById(id: string): Promise<DatePackage | null> {
    return this.packagesRepository.findOne({
      where: { id },
      relations: ['template'],
    });
  }
}
