// app/api/bookmarks/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
// Schema validation
const bookmarkCreateSchema = z.object({
  bookId: z.number(),
  userId: z.number(),
  progress: z.number().min(0).max(100).optional().default(0),
});

// GET /api/bookmarks?userId=123
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = parseInt(searchParams.get('userId'));

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        deletedAt: null, // Exclude soft-deleted
      },
      select: {
        id: true,
        progress: true,
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    });

    return NextResponse.json(bookmarks, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/bookmarks
export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = bookmarkCreateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  const { bookId, userId, progress } = result.data;

  try {
    const [book, user] = await Promise.all([
      prisma.book.findUnique({ where: { id: bookId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    ]);

    if (!book || !user) {
      return NextResponse.json({ error: 'Book or User not found' }, { status: 404 });
    }

    const bookmark = await prisma.bookmark.upsert({
      where: { userId_bookId: { userId, bookId } },
      update: { progress },
      create: { bookId, userId, progress },
    });

    return NextResponse.json(bookmark, { status: 200 });
  } catch (error) {
    console.error('Error creating/updating bookmark:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}