import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/books/[id] - Get book by ID
export async function GET(request, { params }) {
  const { id } = await params; // ✅ Await params

  if (isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
  }

  const bookId = parseInt(id);

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        categories: true,
        bookmarks: true,
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book, { status: 200 });
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/books/[id] - Update book
export async function PUT(request, { params }) {
  const { id } = await params; // ✅ Await params

  if (isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
  }

  const bookId = parseInt(id);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    title,
    author,
    language,
    coverImage,
    smallDescription,
    content,
    pageCount,
    audioLink,
    relatedInfo,
    categoryIds = [],
  } = body;

  try {
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        title,
        author,
        language,
        coverImage,
        smallDescription,
        content,
        pageCount: pageCount ? parseInt(pageCount) : null,
        audioLink,
        relatedInfo,
        categories: {
          set: categoryIds.map((id) => ({ id: parseInt(id) })),
        },
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(updatedBook, { status: 200 });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/books/[id] - Delete book
export async function DELETE(request, { params }) {
  const { id } = await params; // ✅ Await params

  if (isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
  }

  const bookId = parseInt(id);

  try {
    await prisma.book.delete({
      where: { id: bookId },
    });

    return NextResponse.json({ message: 'Book deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}