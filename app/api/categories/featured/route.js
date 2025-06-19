import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import {
  getFeaturedBooksFromCache,
  updateFeaturedBooksCache,
} from '@/utils/cache';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check cache first
    const cachedResult = getFeaturedBooksFromCache();
    if (cachedResult) {
      return NextResponse.json(cachedResult, { status: 200 });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Optimized Query: Get trending books with minimal data
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
      select: {
        id: true,
        title: true,
        coverImage: true,
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Optimized Query: Top bookmarked books overall
    const recommended = await prisma.book.findMany({
      orderBy: {
        bookmarks: {
          _count: 'desc',
        },
      },
      take: 10,
      select: {
        id: true,
        title: true,
        coverImage: true,
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const result = { trending, recommended };

    // Update cache
    updateFeaturedBooksCache(result);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching featured books:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}