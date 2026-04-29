// Reads X-Session-ID header and attaches it to req.sessionId
// If missing, generates a temporary one for this request.
import { randomUUID } from 'crypto';

export function sessionMiddleware(req, _res, next) {
  req.sessionId = req.headers['x-session-id'] || randomUUID();
  next();
}
