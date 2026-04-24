import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { BookingStatus } from "@prisma/client";

const router = Router();

// GET /api/companion/dashboard
router.get("/dashboard", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const profile = await prisma.companionProfile.findUnique({
      where: { userId },
      select: { id: true, totalEarnings: true, hourlyRate: true, isApproved: true },
    });

    if (!profile) {
      res.status(403).json({ error: "Not a companion" });
      return;
    }

    const [pendingCount, upcomingCount, completedCount, reviews] = await Promise.all([
      prisma.booking.count({ where: { companionId: profile.id, status: BookingStatus.PENDING } }),
      prisma.booking.count({
        where: { companionId: profile.id, status: { in: [BookingStatus.ACCEPTED, BookingStatus.PAID] } },
      }),
      prisma.booking.count({ where: { companionId: profile.id, status: BookingStatus.COMPLETED } }),
      prisma.review.findMany({ where: { companionId: profile.id }, select: { rating: true } }),
    ]);

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    res.json({
      dashboard: {
        totalEarnings: profile.totalEarnings,
        hourlyRate: profile.hourlyRate,
        isApproved: profile.isApproved,
        pendingRequests: pendingCount,
        upcomingBookings: upcomingCount,
        completedBookings: completedCount,
        totalReviews: reviews.length,
        avgRating,
      },
    });
  } catch (error) {
    console.error("companion dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/companion/profile
router.patch("/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { hourlyRate, bio, photos, availability } = req.body;

    const profile = await prisma.companionProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(403).json({ error: "Not a companion" });
      return;
    }

    const profileData: Record<string, unknown> = {};
    if (hourlyRate !== undefined) profileData.hourlyRate = parseFloat(hourlyRate);
    if (photos !== undefined) profileData.photos = photos;
    if (availability !== undefined) profileData.availability = availability;

    const userDataFields: Record<string, unknown> = {};
    if (bio !== undefined) userDataFields.bio = bio;

    const [updatedProfile] = await Promise.all([
      prisma.companionProfile.update({
        where: { userId },
        data: profileData,
      }),
      Object.keys(userDataFields).length > 0
        ? prisma.user.update({ where: { id: userId }, data: userDataFields })
        : Promise.resolve(null),
    ]);

    res.json({ profile: updatedProfile });
  } catch (error) {
    console.error("companion profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/companion/online
router.patch("/online", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { isOnline } = req.body;

    if (typeof isOnline !== "boolean") {
      res.status(400).json({ error: "isOnline must be a boolean" });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: isOnline ? undefined : new Date(),
      },
      select: { id: true, isOnline: true, lastSeen: true },
    });

    res.json({ user });
  } catch (error) {
    console.error("companion online status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
