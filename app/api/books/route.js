import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/books - Get all books
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        categories: true,
      },
    });
    return NextResponse.json(books, { status: 200 });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/books - Create a new book
export async function POST(request) {
  try {
    const body = await request.json();

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
    } = body;

    if (!title || !author || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: title, author, or language' },
        { status: 400 }
      );
    }

    // Fetch category IDs by name
    const categories = await prisma.category.findMany({
      where: {
        name: {
          in: categoryNames,
        },
      },
    });

    const categoryIds = categories.map((cat) => cat.id);

    const book = await prisma.book.create({
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
          connect: categoryIds.map((id) => ({ id })),
        },
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}