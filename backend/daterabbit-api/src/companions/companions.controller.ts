import { Controller, Get, Query, Param } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('companions')
export class CompanionsController {
  constructor(private usersService: UsersService) {}

  @Get()
  async searchCompanions(
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('maxDistance') maxDistance?: string,
    @Query('minRating') minRating?: string,
    @Query('ageMin') ageMin?: string,
    @Query('ageMax') ageMax?: string,
    @Query('sortBy') sortBy?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const { companions, total } = await this.usersService.getCompanions({
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      ageMin: ageMin ? parseInt(ageMin) : undefined,
      ageMax: ageMax ? parseInt(ageMax) : undefined,
      sortBy,
      search,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    });

    return {
      companions: companions.map((c) => ({
        id: c.id,
        name: c.name,
        age: c.age,
        location: c.location,
        bio: c.bio,
        primaryPhoto: c.photos?.[0]?.url || null,
        hourlyRate: c.hourlyRate,
        rating: c.rating,
        reviewCount: c.reviewCount,
        isVerified: c.isVerified,
      })),
      total,
    };
  }

  @Get(':id')
  async getCompanion(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user || user.role !== 'companion') {
      return { error: 'Companion not found' };
    }

    return {
      id: user.id,
      name: user.name,
      age: user.age,
      location: user.location,
      bio: user.bio,
      photos: user.photos,
      hourlyRate: user.hourlyRate,
      rating: user.rating,
      reviewCount: user.reviewCount,
      isVerified: user.isVerified,
    };
  }
}
