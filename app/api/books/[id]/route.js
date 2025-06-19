// app/api/books/[id]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { saveImage } from '@/utils/saveImage';
import { updateBooksCache } from '@/utils/cache';


const prisma = new PrismaClient();

// GET /api/books/[id]
export async function GET(request, { params }) {
  const { id } = await params;
  const bookId = parseInt(id);
  if (isNaN(bookId)) {
    return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
  }

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

// PUT /api/books/[id]
export async function PUT(request, { params }) {
  const { id } = await params;
  const bookId = parseInt(id);
  const formData = await request.formData();
  const title = formData.get("title");
  const author = formData.get("author");
  const language = formData.get("language");
  const coverImageFile = formData.get("coverImage");
  const smallDescription = formData.get("smallDescription");
  const content = formData.get("content");
  const pageCount = formData.get("pageCount");
  const audioLink = formData.get("audioLink");
  const relatedInfo = formData.get("relatedInfo");
  const layout = formData.get("layout") || "MIXED";
  const categoryNames = formData.getAll("categoryNames");
  const imageFiles = formData.getAll("images");
  let contentBlocks = [];
  try {
    const raw = formData.get("contentBlocks");
    contentBlocks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    return NextResponse.json({ error: "Invalid contentBlocks format" }, { status: 400 });
  }

  // Upload cover image
  let coverImageUrl = null;
  if (coverImageFile && coverImageFile.size > 0) {
    coverImageUrl = await saveImage(coverImageFile);
  }

  // Upload multiple images
  let imageUrls = [];
  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const url = await saveImage(file);
      imageUrls.push(url);
    }
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

  const updatedBook = await prisma.book.update({
    where: { id: bookId },
    data: {
      title,
      author,
      language,
      coverImage: coverImageUrl,
      smallDescription,
      content,
      pageCount: pageCount ? parseInt(pageCount) : undefined,
      audioLink,
      relatedInfo,
      layout,
      images: { set: imageUrls },
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

  // Clear cache
  updateBooksCache(null);

  return NextResponse.json(updatedBook, { status: 200 });
}

// DELETE /api/books/[id]
export async function DELETE(request, { params }) {
  const { id } = await params;
  const bookId = parseInt(id);
  if (isNaN(bookId)) {
    return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
  }

  try {
    await prisma.bookmark.deleteMany({ where: { bookId } });
    await prisma.book.delete({ where: { id: bookId } });

    // Clear cache
    updateBooksCache(null);

    return NextResponse.json({ message: 'Book deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}