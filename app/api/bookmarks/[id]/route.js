// app/api/bookmarks/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';


const prisma = new PrismaClient();
// Schema validation
const bookmarkUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
});

// PUT /api/bookmarks/[id]
export async function PUT(request, { params }) {
  const { id } = await params;

  if (isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Invalid bookmark ID' }, { status: 400 });
  }

  const bookmarkId = parseInt(id);

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = bookmarkUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  const { progress } = result.data;

  try {
    const updatedBookmark = await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { progress },
    });

    return NextResponse.json(updatedBookmark, { status: 200 });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/bookmarks/[id]
export async function DELETE(request, { params }) {
  const { id } = await params;

  if (isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Invalid bookmark ID' }, { status: 400 });
  }

  const bookmarkId = parseInt(id);

  try {
    // Soft delete
    await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Bookmark soft-deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}