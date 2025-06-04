import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/books/[id] - Get book by ID
export async function GET(request, { params }) {
  const { id } = await params;

  if (isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
  }

  const bookId = parseInt(id);

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        categories: true,
        contentBlocks: {
          orderBy: { order: 'asc' },
        },
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
// PUT /api/books/[id] - Update book
export async function PUT(request, { params }) {
  const { id } = await params;

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
    categoryNames = [],
    layout,
    contentBlocks = [],
  } = body;

  // Ensure categories exist — create missing ones
  const existingCategories = await prisma.category.findMany({
    where: { name: { in: categoryNames } },
  });

  const existingNames = existingCategories.map(cat => cat.name);
  const newNames = categoryNames.filter(name => !existingNames.includes(name));

  let newCategories = [];
  if (newNames.length > 0) {
    newCategories = await prisma.category.createManyAndReturn({
      data: newNames.map(name => ({ name })),
    });
  }

  const allCategories = [...existingCategories, ...newCategories];
  const categoryIds = allCategories.map(cat => cat.id);

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
        pageCount: pageCount ? parseInt(pageCount) : undefined,
        audioLink,
        relatedInfo,
        layout,
        categories: {
          set: categoryIds.map(id => ({ id })),
        },
        contentBlocks: {
          deleteMany: {},
          create: contentBlocks.map(block => ({
            type: block.type,
            content: block.content,
            order: block.order,
          })),
        },
      },
      include: {
        categories: true,
        contentBlocks: true,
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
  const { id } = await params;

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