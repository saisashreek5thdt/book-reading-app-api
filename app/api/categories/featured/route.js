import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Books that have been actively read recently
    const trending = await prisma.book.findMany({
      where: {
        bookmarks: {
          some: {
            updatedAt: {
              gte: oneWeekAgo,
            },
          },
        },
      },
      take: 10,
      include: {
        categories: true,
      },
    });

    // Top bookmarked books overall
    const recommended = await prisma.book.findMany({
      orderBy: [
        {
          bookmarks: {
            _count: 'desc',
          },
        },
      ],
      take: 10,
      include: {
        categories: true,
      },
    });

    return NextResponse.json({ trending, recommended }, { status: 200 });
  } catch (error) {
    console.error('Error fetching featured books:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}