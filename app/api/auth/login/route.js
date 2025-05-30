import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies as getCookies } from 'next/headers';

export async function POST(request) {
  const origin = request.headers.get('origin');
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }

  const user = await prisma.user.findUnique({ where: { email },  select: {
      id: true,
      email: true,
      fullName: true,
      mobile: true,
      password: true,
    },});

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }

  const token = signToken(user);
  const cookies = await getCookies();

  cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60, // 1 hour
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });

  return NextResponse.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName, 
      mobile: user.mobile, 
    },
    token, 
  }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}