import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import supabase from '../services/supabaseService.js';

const router = Router();
router.use(requireAuth);

// GET /api/user/profile
router.get('/profile', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, avatar_url, created_at')
      .eq('id', req.user.userId)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// PATCH /api/user/profile
router.patch('/profile', async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar_url'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No valid fields to update' });

    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', req.user.userId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/user/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [{ count: convCount }, { count: msgCount }] = await Promise.all([
      supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('user_id', req.user.userId),
      supabase.from('messages').select('messages.id', { count: 'exact', head: true })
        .eq('conversations.user_id', req.user.userId)
    ]);
    res.json({ conversations: convCount || 0, messages: msgCount || 0 });
  } catch (err) { next(err); }
});

export default router;
