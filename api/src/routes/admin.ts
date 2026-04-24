import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Middleware: require ADMIN role (looks up DB since JWT has no role field)
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });
    if (!user || user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/admin/stats
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [users, pendingVerifications, activeBookings] = await Promise.all([
      prisma.user.count(),
      prisma.verificationRequest.count({ where: { status: "PENDING" } }),
      prisma.booking.count({
        where: { status: { in: ["ACCEPTED", "PAID", "PENDING"] } },
      }),
    ]);

    res.json({
      users,
      pendingVerifications,
      activeBookings,
      openDisputes: 0, // No Dispute model yet
    });
  } catch (error) {
    console.error("admin/stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users?search&role&page&limit
router.get("/users", async (req: Request, res: Response) => {
  try {
    const { search = "", role = "", page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (role && role !== "ALL") {
      where.role = role as string;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    // isBanned doesn't exist in schema — expose as false always for now
    const usersWithBan = users.map((u: typeof users[number]) => ({ ...u, isBanned: false }));

    res.json({ users: usersWithBan, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("admin/users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/users/:id/ban — stub (no isBanned field yet)
router.post("/users/:id/ban", async (req: Request, res: Response) => {
  try {
    // Stub: field not in schema yet
    const id = req.params["id"] as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error("admin/ban error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/users/:id/unban — stub
router.post("/users/:id/unban", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error("admin/unban error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/verifications?status
router.get("/verifications", async (req: Request, res: Response) => {
  try {
    const { status = "PENDING" } = req.query;
    const verifications = await prisma.verificationRequest.findMany({
      where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ verifications });
  } catch (error) {
    console.error("admin/verifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/verifications/:id/approve
router.put("/verifications/:id/approve", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    await prisma.verificationRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("admin/verifications/approve error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/verifications/:id/reject
router.put("/verifications/:id/reject", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const { reason } = req.body as { reason?: string };
    await prisma.verificationRequest.update({
      where: { id },
      data: { status: "REJECTED", notes: reason || null },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("admin/verifications/reject error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/bookings?status&page
router.get("/bookings", async (req: Request, res: Response) => {
  try {
    const { status = "", page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      where.status = status as string;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          seeker: { select: { id: true, name: true, avatar: true } },
          companion: {
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ bookings, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("admin/bookings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/bookings/:id/cancel
router.post("/bookings/:id/cancel", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("admin/bookings/cancel error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/disputes — stub (no Dispute model)
router.get("/disputes", async (_req: Request, res: Response) => {
  res.json({ disputes: [] });
});

// PUT /api/admin/disputes/:id/resolve — stub
router.put("/disputes/:id/resolve", async (req: Request, res: Response) => {
  res.json({ success: true });
});

// GET /api/admin/cities
router.get("/cities", async (_req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });
    res.json({ cities });
  } catch (error) {
    console.error("admin/cities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/cities
router.post("/cities", async (req: Request, res: Response) => {
  try {
    const { name, country } = req.body as { name?: string; country?: string };
    if (!name || !country) {
      res.status(400).json({ error: "name and country are required" });
      return;
    }
    const city = await prisma.city.create({ data: { name, country } });
    res.status(201).json({ city });
  } catch (error) {
    console.error("admin/cities POST error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/cities/:id
router.patch("/cities/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const { isActive, name, country } = req.body as {
      isActive?: boolean;
      name?: string;
      country?: string;
    };
    const data: Record<string, unknown> = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (name !== undefined) data.name = name;
    if (country !== undefined) data.country = country;

    const city = await prisma.city.update({
      where: { id },
      data,
    });
    res.json({ city });
  } catch (error) {
    console.error("admin/cities PATCH error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
