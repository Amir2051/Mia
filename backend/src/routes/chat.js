import { Router } from 'express';
import { chat } from '../services/aiService.js';
import {
  createConversation, getSessionConversations, deleteConversation,
  saveMessage, getConversationMessages, updateConversationTitle
} from '../services/supabaseService.js';

const router = Router();

// GET /api/chat/conversations
router.get('/conversations', async (req, res, next) => {
  try {
    const convs = await getSessionConversations(req.sessionId);
    res.json(convs);
  } catch (err) { next(err); }
});

// POST /api/chat/conversations
router.post('/conversations', async (req, res, next) => {
  try {
    const conv = await createConversation(req.sessionId, req.body.title);
    res.status(201).json(conv);
  } catch (err) { next(err); }
});

// DELETE /api/chat/conversations/:id
router.delete('/conversations/:id', async (req, res, next) => {
  try {
    await deleteConversation(req.params.id, req.sessionId);
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

// POST /api/chat/message — persist + reply (non-streaming)
router.post('/message', async (req, res, next) => {
  try {
    const { conversation_id, content, history = [] } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'content is required' });

    let convId = conversation_id;
    if (!convId) {
      const conv = await createConversation(req.sessionId, content.slice(0, 60));
      convId = conv.id;
    }

    await saveMessage({ conversation_id: convId, role: 'user', content });

    const messages    = [...history.slice(-20), { role: 'user', content }];
    const aiResponse  = await chat({ messages });

    const saved = await saveMessage({
      conversation_id: convId,
      role:            'assistant',
      content:         aiResponse.content
    });

    if (history.length === 0) updateConversationTitle(convId, content.slice(0, 60));

    res.json({ conversation_id: convId, message: saved, content: aiResponse.content });
  } catch (err) { next(err); }
});

// POST /api/chat/stream — streaming SSE
router.post('/stream', async (req, res, next) => {
  try {
    const { content, history = [], conversation_id } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'content is required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Resolve or create conversation, then send its ID to the client
    let convId = conversation_id;
    if (!convId) {
      const conv = await createConversation(req.sessionId, content.slice(0, 60));
      convId = conv.id;
      res.write(`data: ${JSON.stringify({ conversation_id: convId })}\n\n`);
    }

    await saveMessage({ conversation_id: convId, role: 'user', content });

    const messages = [...history.slice(-20), { role: 'user', content }];
    const stream   = await chat({ messages, stream: true });

    let full = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta.text;
        full += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    await saveMessage({ conversation_id: convId, role: 'assistant', content: full });
    if (history.length === 0) updateConversationTitle(convId, content.slice(0, 60));

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) { next(err); }
});

export default router;
