import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const TOKEN_NAME = '__session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

/** Check creds → set signed cookie. Returns true on success. */
export async function login(username: string, password: string) {
  if (username !== process.env.ADMIN_USERNAME) return false;

  // Check if it's a bcrypt hash (starts with $2b$) or plain text
  const adminPassword = process.env.ADMIN_PASSWORD_HASH!;
  let ok = false;
  
  if (adminPassword.startsWith('$2b$')) {
    // It's a bcrypt hash
    ok = await bcrypt.compare(password, adminPassword);
  } else {
    // It's plain text (for development)
    ok = password === adminPassword;
  }
  
  if (!ok) return false;

  const jwt = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());

  cookies().set(TOKEN_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
  return true;
}

/** Destroy session cookie */
export function logout() {
  cookies().delete(TOKEN_NAME);
}

/** Return current user (or null). */
export async function currentUser() {
  const token = cookies().get(TOKEN_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as { username: string };
  } catch {
    return null;
  }
} 