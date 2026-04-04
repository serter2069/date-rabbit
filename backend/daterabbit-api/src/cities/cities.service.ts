import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepo: Repository<City>,
  ) {}

  async findAll(activeOnly = true): Promise<City[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.citiesRepo.find({
      where,
      order: { state: 'ASC', name: 'ASC' },
    });
  }

  async create(dto: CreateCityDto): Promise<City> {
    const city = this.citiesRepo.create(dto);
    return this.citiesRepo.save(city);
  }

  async update(id: string, dto: UpdateCityDto): Promise<City> {
    const city = await this.citiesRepo.findOne({ where: { id } });
    if (!city) {
      throw new NotFoundException('City not found');
    }
    Object.assign(city, dto);
    return this.citiesRepo.save(city);
  }
}
