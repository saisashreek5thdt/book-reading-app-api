import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId || isNaN(parseInt(userId))) {
    return NextResponse.json(
      { error: "Valid userId is required" },
      { status: 400 }
    );
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        book: true,
      },
    });

    return NextResponse.json(bookmarks, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let body;

  // Safely parse JSON
  try{
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { bookId, userId, progress } = body;

  // Validate required fields
  if (![bookId, userId, progress].every(x => x !== undefined && x !== null)) {
    return NextResponse.json(
      { error: 'Missing required fields: bookId, userId, progress' },
      { status: 400 }
    );
  }

  // Validate types
  if (
    isNaN(parseInt(bookId)) ||
    isNaN(parseInt(userId)) ||
    isNaN(parseFloat(progress))
  ) {
    return NextResponse.json(
      { error: 'Invalid data types: bookId, userId must be numbers, progress must be numeric' },
      { status: 400 }
    );
  }

  const parsedBookId = parseInt(bookId);
  const parsedUserId = parseInt(userId);
  const parsedProgress = parseFloat(progress);

  try {
    // 🔍 Check if book and user exist
    const [book, user] = await Promise.all([
      prisma.book.findUnique({ where: { id: parsedBookId } }),
      prisma.user.findUnique({ where: { id: parsedUserId } }),
    ]);

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ✅ Proceed with upsert
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_bookId: {
          userId: parsedUserId,
          bookId: parsedBookId,
        },
      },
      update: {
        progress: parsedProgress,
      },
      create: {
        bookId: parsedBookId,
        userId: parsedUserId,
        progress: parsedProgress,
      },
    });

    return NextResponse.json(bookmark, { status: 200 });
  } catch (error) {
    console.error('Error creating/updating bookmark:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}