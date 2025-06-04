import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/books - Get all books with categories and contentBlocks
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        categories: true,
        contentBlocks: {
          orderBy: { order: 'asc' },
        },
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
      layout = "MIXED",
      contentBlocks = [],
    } = body;

    if (!title || !author || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: title, author, or language' },
        { status: 400 }
      );
    }

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
        layout,
        categories: {
          connect: categoryIds.map(id => ({ id })),
        },
        contentBlocks: {
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

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}