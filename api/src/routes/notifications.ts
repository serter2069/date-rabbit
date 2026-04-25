import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authMiddleware, async (_req, res) => {
  res.json({ notifications: [] }); // stub
});

// POST /api/notifications/:id/read
router.post('/:id/read', authMiddleware, async (_req, res) => {
  res.json({ success: true });
});

// POST /api/notifications/read-all
router.post('/read-all', authMiddleware, async (_req, res) => {
  res.json({ success: true });
});

export default router;
