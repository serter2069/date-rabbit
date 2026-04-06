import { Controller, Get, Query, Param, NotFoundException, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ReviewsService } from '../reviews/reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('companions')
export class CompanionsController {
  constructor(
    private usersService: UsersService,
    private reviewsService: ReviewsService,
  ) {}

  @Get('public')
  async searchPublicCompanions(
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('sortBy') sortBy?: string,
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('availability') availability?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('page') page?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit) : 20;
    const parsedOffset = page
      ? (parseInt(page) - 1) * parsedLimit
      : offset
        ? parseInt(offset)
        : 0;

    const { companions, total } = await this.usersService.getCompanions({
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      sortBy,
      search,
      city,
      availability,
      limit: parsedLimit,
      offset: parsedOffset,
    });

    const currentPage = page ? parseInt(page) : Math.floor(parsedOffset / parsedLimit) + 1;

    return {
      companions: companions.map((c: any) => ({
        id: c.id,
        name: c.name,
        age: c.age,
        location: c.location,
        shortBio: c.bio ? c.bio.substring(0, 100) : null,
        primaryPhoto: (Array.isArray(c.photos) && c.photos.length > 0)
          ? (c.photos.find((p: any) => p.isPrimary) ?? c.photos[0])?.url ?? null
          : null,
        hourlyRate: c.hourlyRate != null ? Number(c.hourlyRate) : 0,
        rating: c.rating ? Number(c.rating) : null,
        reviewCount: c.reviewCount || 0,
        isVerified: c.isVerified || false,
      })),
      total,
      page: currentPage,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  // Browse requires JWT auth only — no fingerprintStatus/Checkr gate.
  // Checkr background check deferred to v2. Seeker verified = Stripe Identity passed only.
  @UseGuards(JwtAuthGuard)
  @Get()
  async searchCompanions(
    @Request() req,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('maxDistance') maxDistance?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('minRating') minRating?: string,
    @Query('ageMin') ageMin?: string,
    @Query('ageMax') ageMax?: string,
    @Query('sortBy') sortBy?: string,
    @Query('search') search?: string,
    @Query('activityTypes') activityTypesRaw?: string,
    @Query('availability') availability?: string,
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

    // Parse activityTypes from comma-separated string (e.g. "coffee,dinner")
    const activityTypes =
      activityTypesRaw && activityTypesRaw.trim()
        ? activityTypesRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;

    // Exclude blocked users (req.user is guaranteed by JwtAuthGuard)
    const excludeUserIds = await this.usersService.getBlockedUserIds(req.user.id);

    const { companions, total } = await this.usersService.getCompanions({
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      ageMin: ageMin ? Math.max(parseInt(ageMin), 21) : undefined,
      ageMax: ageMax ? parseInt(ageMax) : undefined,
      sortBy,
      search,
      activityTypes,
      availability,
      limit: parsedLimit,
      offset: parsedOffset,
      excludeUserIds,
    });

    const currentPage = page ? parseInt(page) : Math.floor(parsedOffset / parsedLimit) + 1;

    return {
      companions: companions.map((c: any) => ({
        id: c.id,
        name: c.name,
        age: c.age,
        location: c.location,
        shortBio: c.bio ? c.bio.substring(0, 100) : null,
        primaryPhoto: (Array.isArray(c.photos) && c.photos.length > 0)
          ? (c.photos.find((p: any) => p.isPrimary) ?? c.photos[0])?.url ?? null
          : null,
        hourlyRate: c.hourlyRate != null ? Number(c.hourlyRate) : 0,
        rating: c.rating ? Number(c.rating) : null,
        reviewCount: c.reviewCount || 0,
        isVerified: c.isVerified || false,
        distance: c.distance != null ? Math.round(c.distance * 10) / 10 : undefined,
        lastSeen: c.lastSeen ? c.lastSeen.toISOString() : null,
      })),
      total,
      page: currentPage,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getCompanion(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user || user.role !== 'companion') {
      throw new NotFoundException('Companion not found');
    }

    // Fetch recent reviews for this companion
    const { reviews } = await this.reviewsService.getReviewsForUser(id, 1, 3);

    return {
      id: user.id,
      name: user.name,
      age: user.age,
      location: user.location,
      bio: user.bio,
      interests: user.interests || [],
      photos: user.photos || [],
      hourlyRate: user.hourlyRate != null ? Number(user.hourlyRate) : 0,
      rating: user.rating ? Number(user.rating) : null,
      reviewCount: user.reviewCount || 0,
      isVerified: user.isVerified || false,
      lastSeen: user.lastSeen ? user.lastSeen.toISOString() : null,
      reviews: reviews.map((r) => ({
        id: r.id,
        name: r.reviewer?.name || 'Anonymous',
        rating: r.rating,
        text: r.comment || '',
        date: r.createdAt.toISOString().split('T')[0],
      })),
    };
  }
}
