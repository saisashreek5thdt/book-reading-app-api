import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies as getCookies } from 'next/headers';

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken(user);

  // ✅ Await cookies()
  const cookies = await getCookies();
  cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60, // 1 hour
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return NextResponse.json({ message: 'Login successful' }, { status: 200 });
}
