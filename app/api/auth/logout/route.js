import { NextResponse } from 'next/server';
import { cookies as getCookies } from 'next/headers';

export async function POST() {
  const cookies = await getCookies();

  cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0, // Clear cookie immediately
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });

  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}