// app/api/auth/register/route.js
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { fullName, email, password,mobile } = body;

  if (!fullName || !email || !password) {
    return NextResponse.json({ message: 'All fields required' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: 'Email already registered' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      mobile
    },
  });

  return NextResponse.json({
    message: 'User registered successfully',
    user: { id: newUser.id, fullName, email, mobile },
  }, { status: 201 });
}
