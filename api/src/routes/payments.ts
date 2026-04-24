import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

// POST /api/payments/bookings/:bookingId/pay — stub Stripe authorization
router.post("/bookings/:bookingId/pay", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const bookingId = req.params["bookingId"] as string;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, seekerId: true, status: true },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.seekerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (booking.status !== "PENDING" && booking.status !== "ACCEPTED") {
      res.status(400).json({ error: "Booking is not in a payable state" });
      return;
    }

    // Stub: in production this would create a Stripe PaymentIntent and confirm it
    // For now we just mark the booking as PAID
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "PAID" },
    });

    res.json({ success: true, message: "Payment authorized" });
  } catch (error) {
    console.error("payment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
