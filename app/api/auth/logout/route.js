import { NextResponse } from 'next/server';
import { cookies as getCookies } from 'next/headers';

export async function POST() {
  const cookies = await getCookies();

  cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0), // Set to past date
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}
