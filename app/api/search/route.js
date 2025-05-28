import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || typeof q !== 'string') {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    const results = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: q.trim(), mode: 'insensitive' } },
          { author: { contains: q.trim(), mode: 'insensitive' } },
          {
            categories: {
              some: {
                name: { contains: q.trim(), mode: 'insensitive' },
              },
            },
          },
        ],
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error during search:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}