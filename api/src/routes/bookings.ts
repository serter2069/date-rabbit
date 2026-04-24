import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { BookingStatus } from "@prisma/client";

const router = Router();

const PLATFORM_FEE_RATE = 0.15;
const STRIPE_FEE_RATE = 0.029;
const STRIPE_FEE_FIXED = 0.30;

// GET /api/bookings — list current user's bookings
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { filter = "all", page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const statusMap: Record<string, BookingStatus[]> = {
      upcoming: [BookingStatus.ACCEPTED, BookingStatus.PAID],
      pending: [BookingStatus.PENDING],
      completed: [BookingStatus.COMPLETED],
      all: Object.values(BookingStatus),
    };

    const statuses = statusMap[filter as string] ?? Object.values(BookingStatus);

    // User might be seeker or companion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companionProfile: { select: { id: true } } },
    });

    const companionId = user?.companionProfile?.id;

    const where: Record<string, unknown> = {
      status: { in: statuses },
      OR: [
        { seekerId: userId },
        ...(companionId ? [{ companionId }] : []),
      ],
    };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        seeker: { select: { id: true, name: true, avatar: true } },
        companion: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        review: { select: { id: true, rating: true } },
      },
      orderBy: { date: "asc" },
      skip,
      take: limitNum,
    });

    const total = await prisma.booking.count({ where });

    res.json({ bookings, page: pageNum, limit: limitNum, total });
  } catch (error) {
    console.error("bookings list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bookings — create booking
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const seekerId = req.user!.userId;
    const { companionId, date, durationHours, activity, location, notes } = req.body;

    if (!companionId || !date || !durationHours || !activity || !location) {
      res.status(400).json({ error: "companionId, date, durationHours, activity, location are required" });
      return;
    }

    const companion = await prisma.companionProfile.findUnique({
      where: { id: companionId },
    });

    if (!companion || !companion.isApproved || !companion.isPublic) {
      res.status(404).json({ error: "Companion not found" });
      return;
    }

    if (companion.userId === seekerId) {
      res.status(400).json({ error: "Cannot book yourself" });
      return;
    }

    const baseAmount = companion.hourlyRate * durationHours;
    const platformFee = parseFloat((baseAmount * PLATFORM_FEE_RATE).toFixed(2));
    const stripeFee = parseFloat((baseAmount * STRIPE_FEE_RATE + STRIPE_FEE_FIXED).toFixed(2));
    const totalAmount = parseFloat((baseAmount + platformFee + stripeFee).toFixed(2));

    const booking = await prisma.booking.create({
      data: {
        seekerId,
        companionId,
        date: new Date(date),
        durationHours,
        activity,
        location,
        notes,
        totalAmount,
        platformFee,
        stripeFee,
      },
      include: {
        seeker: { select: { id: true, name: true, avatar: true } },
        companion: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    res.status(201).json({ booking });
  } catch (error) {
    console.error("create booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bookings/requests — companion pending requests
router.get("/requests", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const profile = await prisma.companionProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      res.status(403).json({ error: "Not a companion" });
      return;
    }

    const requests = await prisma.booking.findMany({
      where: { companionId: profile.id, status: BookingStatus.PENDING },
      include: {
        seeker: { select: { id: true, name: true, avatar: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ requests });
  } catch (error) {
    console.error("booking requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/bookings/:id/accept
router.put("/:id/accept", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params["id"] as string;

    const profile = await prisma.companionProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      res.status(403).json({ error: "Not a companion" });
      return;
    }

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking || booking.companionId !== profile.id) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.status !== BookingStatus.PENDING) {
      res.status(400).json({ error: "Booking is not pending" });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.ACCEPTED },
    });

    res.json({ booking: updated });
  } catch (error) {
    console.error("accept booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/bookings/:id/decline
router.put("/:id/decline", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params["id"] as string;

    const profile = await prisma.companionProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      res.status(403).json({ error: "Not a companion" });
      return;
    }

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking || booking.companionId !== profile.id) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.status !== BookingStatus.PENDING) {
      res.status(400).json({ error: "Booking is not pending" });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.DECLINED },
    });

    res.json({ booking: updated });
  } catch (error) {
    console.error("decline booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bookings/:id — booking detail
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params["id"] as string;

    const profile = await prisma.companionProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        seeker: { select: { id: true, name: true, avatar: true } },
        companion: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        payment: true,
        review: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    // Only seeker or companion can view
    const isSeeker = booking.seekerId === userId;
    const isCompanion = profile && booking.companionId === profile.id;

    if (!isSeeker && !isCompanion) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json({ booking });
  } catch (error) {
    console.error("booking detail error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
