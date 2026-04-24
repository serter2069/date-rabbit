import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { BookingStatus } from "@prisma/client";

const router = Router();

// POST /api/reviews
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const seekerId = req.user!.userId;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      res.status(400).json({ error: "bookingId and rating are required" });
      return;
    }

    const ratingNum = parseInt(rating, 10);
    if (ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking || booking.seekerId !== seekerId) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      res.status(400).json({ error: "Can only review completed bookings" });
      return;
    }

    const existing = await prisma.review.findUnique({ where: { bookingId } });
    if (existing) {
      res.status(409).json({ error: "Review already submitted for this booking" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        seekerId,
        companionId: booking.companionId,
        rating: ratingNum,
        comment,
      },
    });

    res.status(201).json({ review });
  } catch (error) {
    console.error("create review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
