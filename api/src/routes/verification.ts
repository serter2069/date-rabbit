import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/verification/status
router.get("/status", authMiddleware, (_req: Request, res: Response) => {
  console.log("[verification] GET /status");
  res.json({ status: "pending", reason: null });
});

// POST /api/verification/photo-id
router.post("/photo-id", authMiddleware, (req: Request, res: Response) => {
  console.log("[verification] POST /photo-id", req.headers["content-type"]);
  res.json({ success: true, message: "Government ID photo received" });
});

// POST /api/verification/selfie
router.post("/selfie", authMiddleware, (req: Request, res: Response) => {
  console.log("[verification] POST /selfie", req.headers["content-type"]);
  res.json({ success: true, message: "Selfie photo received" });
});

// POST /api/verification/stripe-identity/start
router.post("/stripe-identity/start", authMiddleware, (_req: Request, res: Response) => {
  console.log("[verification] POST /stripe-identity/start");
  res.json({ clientSecret: "mock_secret_123" });
});

// POST /api/verification/consent
router.post("/consent", authMiddleware, (_req: Request, res: Response) => {
  console.log("[verification] POST /consent");
  res.json({ success: true, consentedAt: new Date().toISOString() });
});

// GET /api/companion/status
// Registered separately in index.ts under /api/companion — we export a companion-status router too
export const companionStatusRouter = Router();

companionStatusRouter.get("/status", authMiddleware, (_req: Request, res: Response) => {
  console.log("[companion] GET /status");
  res.json({ status: "pending", reason: null });
});

export default router;
