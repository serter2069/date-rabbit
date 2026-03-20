import { Controller, Get, Query, Param, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('companions')
export class CompanionsController {
  constructor(private usersService: UsersService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async searchCompanions(
    @Request() req,
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
    @Query('page') page?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit) : 20;
    // Support both page-based and offset-based pagination.
    // page takes precedence over offset when both are provided.
    const parsedOffset = page
      ? (parseInt(page) - 1) * parsedLimit
      : offset
        ? parseInt(offset)
        : 0;

    // Exclude blocked users if the requester is authenticated
    let excludeUserIds: string[] | undefined;
    if (req.user?.id) {
      excludeUserIds = await this.usersService.getBlockedUserIds(req.user.id);
    }

    const { companions, total } = await this.usersService.getCompanions({
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      ageMin: ageMin ? parseInt(ageMin) : undefined,
      ageMax: ageMax ? parseInt(ageMax) : undefined,
      sortBy,
      search,
      limit: parsedLimit,
      offset: parsedOffset,
      excludeUserIds,
    });

    const currentPage = page ? parseInt(page) : Math.floor(parsedOffset / parsedLimit) + 1;

    return {
      companions: companions.map((c) => ({
        id: c.id,
        name: c.name,
        age: c.age,
        location: c.location,
        shortBio: c.bio ? c.bio.substring(0, 100) : null,
        primaryPhoto: c.photos?.[0]?.url || null,
        hourlyRate: c.hourlyRate != null ? Number(c.hourlyRate) : 0,
        rating: c.rating ? Number(c.rating) : 5.0,
        reviewCount: c.reviewCount || 0,
        isVerified: c.isVerified || false,
      })),
      total,
      page: currentPage,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  @Get(':id')
  async getCompanion(@Param('id') id: string) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new NotFoundException('Companion not found');
    }

    const user = await this.usersService.findById(id);
    if (!user || user.role !== 'companion') {
      throw new NotFoundException('Companion not found');
    }

    return {
      id: user.id,
      name: user.name,
      age: user.age,
      location: user.location,
      bio: user.bio,
      photos: user.photos || [],
      hourlyRate: user.hourlyRate != null ? Number(user.hourlyRate) : 0,
      rating: user.rating ? Number(user.rating) : 5.0,
      reviewCount: user.reviewCount || 0,
      isVerified: user.isVerified || false,
    };
  }
}
