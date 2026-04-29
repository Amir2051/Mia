import { Router } from 'express';
import { loginWithGoogle } from '../services/authService.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getUserById } from '../services/supabaseService.js';

const router = Router();

// POST /api/auth/google — exchange Google ID token for JWT
router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken is required' });
    const { user, token } = await loginWithGoogle(idToken);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — get current user from JWT
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout — client just discards token; this is a no-op for stateless JWT
router.post('/logout', requireAuth, (_, res) => res.json({ success: true }));

export default router;
