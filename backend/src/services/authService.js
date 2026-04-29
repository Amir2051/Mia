import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { upsertUser } from './supabaseService.js';
import dotenv from 'dotenv';
dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  return {
    id:         payload.sub,
    email:      payload.email,
    name:       payload.name,
    avatar_url: payload.picture,
    provider:   'google'
  };
}

export function signJWT(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJWT(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function loginWithGoogle(idToken) {
  const googleUser = await verifyGoogleToken(idToken);
  const user       = await upsertUser(googleUser);
  const token      = signJWT({ userId: user.id, email: user.email });
  return { user, token };
}
