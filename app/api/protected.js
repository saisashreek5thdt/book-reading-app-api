import { NextResponse } from 'next/server';
import { cookies as getCookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const cookies = await getCookies();
  const token = cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  return NextResponse.json({ message: 'Protected route accessed', userId: payload.userId }, { status: 200 });
}
