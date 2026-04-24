import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/favorites
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const seekerId = req.user!.userId;

    const favorites = await prisma.favorite.findMany({
      where: { seekerId },
      include: {
        companion: {
          include: {
            user: { select: { id: true, name: true, avatar: true, city: true, isOnline: true } },
            reviews: { select: { rating: true } },
            _count: { select: { reviews: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = favorites.map((f) => ({
      ...f,
      companion: {
        ...f.companion,
        avgRating:
          f.companion.reviews.length > 0
            ? f.companion.reviews.reduce((sum, r) => sum + r.rating, 0) / f.companion.reviews.length
            : null,
        reviews: undefined,
      },
    }));

    res.json({ favorites: result });
  } catch (error) {
    console.error("favorites list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/favorites/:companionId
router.post("/:companionId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const seekerId = req.user!.userId;
    const companionId = req.params["companionId"] as string;

    const companion = await prisma.companionProfile.findUnique({ where: { id: companionId } });
    if (!companion) {
      res.status(404).json({ error: "Companion not found" });
      return;
    }

    const favorite = await prisma.favorite.upsert({
      where: { seekerId_companionId: { seekerId, companionId } },
      update: {},
      create: { seekerId, companionId },
    });

    res.status(201).json({ favorite });
  } catch (error) {
    console.error("add favorite error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/favorites/:companionId
router.delete("/:companionId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const seekerId = req.user!.userId;
    const companionId = req.params["companionId"] as string;

    await prisma.favorite.deleteMany({ where: { seekerId, companionId } });

    res.json({ success: true });
  } catch (error) {
    console.error("remove favorite error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
