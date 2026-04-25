import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/users/me
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        age: true,
        city: true,
        role: true,
        isVerified: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        companionProfile: {
          select: {
            id: true,
            hourlyRate: true,
            isApproved: true,
            isPublic: true,
            photos: true,
            totalEarnings: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("users/me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/users/me
router.patch("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, age, city, bio, avatar } = req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (age !== undefined) data.age = typeof age === "number" ? age : parseInt(age, 10);
    if (city !== undefined) data.city = city;
    if (bio !== undefined) data.bio = bio;
    if (avatar !== undefined) data.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        age: true,
        city: true,
        role: true,
        isVerified: true,
        updatedAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error("PATCH users/me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/users/me
router.delete("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
