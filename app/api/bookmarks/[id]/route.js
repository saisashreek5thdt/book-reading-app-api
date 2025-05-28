import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = await params; // ✅ Await params

  if (isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Invalid bookmark ID' }, { status: 400 });
  }

  const bookmarkId = parseInt(id);

  let body;

  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { progress } = body;

  if (progress === undefined || isNaN(parseFloat(progress))) {
    return NextResponse.json(
      { error: 'Progress must be a valid number' },
      { status: 400 }
    );
  }

  const parsedProgress = parseFloat(progress);

  try {
    const updatedBookmark = await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { progress: parsedProgress },
    });

    return NextResponse.json(updatedBookmark, { status: 200 });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}