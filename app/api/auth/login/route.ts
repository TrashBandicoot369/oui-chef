import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    console.log('Login attempt:', { username, passwordLength: password?.length });
    console.log('Expected username:', process.env.ADMIN_USERNAME);
    console.log('Expected password:', process.env.ADMIN_PASSWORD_HASH);
    
    const ok = await login(username, password);
    console.log('Login result:', ok);
    
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: 'invalid' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
} 