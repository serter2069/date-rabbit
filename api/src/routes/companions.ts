import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/companions — list with filters
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      city,
      priceMin,
      priceMax,
      rating,
      page = "1",
      limit = "20",
      sort = "rating",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {
      isApproved: true,
      isPublic: true,
    };

    if (city) {
      where.user = { city: city as string };
    }

    if (priceMin || priceMax) {
      const rateFilter: Record<string, number> = {};
      if (priceMin) rateFilter.gte = parseFloat(priceMin as string);
      if (priceMax) rateFilter.lte = parseFloat(priceMax as string);
      where.hourlyRate = rateFilter;
    }

    const companions = await prisma.companionProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, city: true, isOnline: true, lastSeen: true },
        },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true, bookingsAsCompanion: true } },
      },
      skip,
      take: limitNum,
    });

    const minRating = rating ? parseFloat(rating as string) : null;

    type CompanionItem = {
      id: string;
      userId: string;
      hourlyRate: number;
      isApproved: boolean;
      isPublic: boolean;
      photos: string[];
      availability: unknown;
      totalEarnings: number;
      createdAt: Date;
      updatedAt: Date;
      user: {
        id: string;
        name: string | null;
        avatar: string | null;
        city: string | null;
        isOnline: boolean;
        lastSeen: Date | null;
      };
      _count: { reviews: number; bookingsAsCompanion: number };
      avgRating: number | null;
    };

    const result: CompanionItem[] = companions
      .map((c) => {
        const avgRating =
          c.reviews.length > 0
            ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length
            : null;
        return {
          id: c.id,
          userId: c.userId,
          hourlyRate: c.hourlyRate,
          isApproved: c.isApproved,
          isPublic: c.isPublic,
          photos: c.photos,
          availability: c.availability,
          totalEarnings: c.totalEarnings,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          user: c.user,
          _count: c._count,
          avgRating,
        };
      })
      .filter((c) => (minRating === null ? true : (c.avgRating ?? 0) >= minRating));

    // Sort
    if (sort === "price_asc") result.sort((a, b) => a.hourlyRate - b.hourlyRate);
    else if (sort === "price_desc") result.sort((a, b) => b.hourlyRate - a.hourlyRate);
    else result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

    const total = await prisma.companionProfile.count({ where });

    res.json({ companions: result, page: pageNum, limit: limitNum, total });
  } catch (error) {
    console.error("companions list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/companions/:id — single profile
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const companion = await prisma.companionProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            city: true,
            age: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        reviews: {
          include: {
            seeker: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { reviews: true, bookingsAsCompanion: true } },
      },
    });

    if (!companion || !companion.isApproved || !companion.isPublic) {
      res.status(404).json({ error: "Companion not found" });
      return;
    }

    const avgRating =
      companion.reviews.length > 0
        ? companion.reviews.reduce((sum: number, r) => sum + r.rating, 0) / companion.reviews.length
        : null;

    res.json({ companion: { ...companion, avgRating } });
  } catch (error) {
    console.error("companion detail error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
