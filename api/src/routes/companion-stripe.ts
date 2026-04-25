import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/companion/stripe-connect/start
router.post('/stripe-connect/start', authMiddleware, async (_req, res) => {
  res.json({ onboardingUrl: 'https://connect.stripe.com/setup/mock' });
});

export default router;
