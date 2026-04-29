import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { chat } from '../services/aiService.js';
import {
  createConversation, getUserConversations, deleteConversation,
  saveMessage, getConversationMessages, updateConversationTitle
} from '../services/supabaseService.js';

const router = Router();
router.use(requireAuth);

// GET /api/chat/conversations
router.get('/conversations', async (req, res, next) => {
  try {
    const convs = await getUserConversations(req.user.userId);
    res.json(convs);
  } catch (err) { next(err); }
});

// POST /api/chat/conversations
router.post('/conversations', async (req, res, next) => {
  try {
    const { title } = req.body;
    const conv = await createConversation(req.user.userId, title);
    res.status(201).json(conv);
  } catch (err) { next(err); }
});

// DELETE /api/chat/conversations/:id
router.delete('/conversations/:id', async (req, res, next) => {
  try {
    await deleteConversation(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', async (req, res, next) => {
  try {
    const msgs = await getConversationMessages(req.params.id);
    res.json(msgs);
  } catch (err) { next(err); }
});

// POST /api/chat/message — send a message and get Mia's reply
router.post('/message', async (req, res, next) => {
  try {
    const { conversation_id, content, history = [] } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'content is required' });

    let convId = conversation_id;

    // Auto-create conversation if not provided
    if (!convId) {
      const title = content.slice(0, 60) + (content.length > 60 ? '...' : '');
      const conv  = await createConversation(req.user.userId, title);
      convId = conv.id;
    }

    // Save user message
    await saveMessage({ conversation_id: convId, role: 'user', content });

    // Build message array from history + new message
    const messages = [...history.slice(-20), { role: 'user', content }];

    // Call AI
    const aiResponse = await chat({ messages });

    // Save assistant message
    const saved = await saveMessage({
      conversation_id: convId,
      role:            'assistant',
      content:         aiResponse.content,
      tokens_used:     aiResponse.tokens_used
    });

    // Auto-update conversation title after first real exchange
    if (history.length === 0) {
      await updateConversationTitle(convId, content.slice(0, 60));
    }

    res.json({
      conversation_id: convId,
      message: saved,
      content: aiResponse.content,
      tokens_used: aiResponse.tokens_used
    });
  } catch (err) { next(err); }
});

// POST /api/chat/stream — streaming response via SSE
router.post('/stream', async (req, res, next) => {
  try {
    const { content, history = [] } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'content is required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messages = [...history.slice(-20), { role: 'user', content }];
    const stream   = await chat({ messages, stream: true });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        res.write(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) { next(err); }
});

export default router;
