import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED = [/^\/admin/, /^\/api\/admin/];
const TOKEN_NAME = '__session';
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function middleware(req: Request & { nextUrl: URL; cookies: any }) {
  if (!PROTECTED.some(rx => rx.test(req.nextUrl.pathname)))
    return NextResponse.next();

  const token = req.cookies.get(TOKEN_NAME)?.value;
  if (!token)
    return NextResponse.redirect(new URL('/login', req.url));

  try {
    await jwtVerify(token, key());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}; 