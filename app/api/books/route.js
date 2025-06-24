// app/api/books/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { uploadImage, uploadImages } from '@/utils/uploadImageToSupabase';
import { getBooksFromCache, updateBooksCache } from '@/utils/cache';

const prisma = new PrismaClient();

// GET /api/books
export async function GET() {
  try {
    const cachedBooks = getBooksFromCache();
    if (cachedBooks) {
      return NextResponse.json(cachedBooks, { status: 200 });
    }

    const books = await prisma.book.findMany({
      include: {
        categories: true,
        contentBlocks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    updateBooksCache(books);

    return NextResponse.json(books, { status: 200 });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  const formData = await request.formData()
  const title = formData.get('title')
  const author = formData.get('author')
  const language = formData.get('language')
  const smallDescription = formData.get('smallDescription')
  const content = formData.get('content')
  const pageCount = parseInt(formData.get('pageCount')) || null
  const audioLink = formData.get('audioLink')
  const relatedInfo = formData.get('relatedInfo')
  const layout = formData.get('layout') || 'MIXED'
  const categoryNames = formData.getAll('categoryNames')
  const coverImageFile = formData.get('coverImage')
  const imageFiles = formData.getAll('images')

  let contentBlocks = []
  try {
    const raw = formData.get('contentBlocks')
    contentBlocks = raw ? JSON.parse(raw) : []
  } catch (e) {
    return NextResponse.json({ error: 'Invalid contentBlocks format' }, { status: 400 })
  }

  // Upload cover image
  let coverImageUrl = null
  if (coverImageFile && coverImageFile instanceof File && coverImageFile.size > 0) {
    coverImageUrl = await uploadImage(coverImageFile, 'covers')
  }

  // Upload multiple images
  let imageUrls = []
  if (imageFiles.length > 0) {
    imageUrls = await uploadImages(imageFiles, 'pages')
  }

  // Ensure categories exist — create missing ones
  const existingCategories = await prisma.category.findMany({
    where: { name: { in: categoryNames } },
  })

  const existingNames = existingCategories.map(cat => cat.name)
  const newNames = categoryNames.filter(name => !existingNames.includes(name))
  let newCategories = []
  if (newNames.length > 0) {
    newCategories = await prisma.category.createManyAndReturn({
      data: newNames.map(name => ({ name })),
    })
  }

  const allCategories = [...existingCategories, ...newCategories]
  const categoryIds = allCategories.map(cat => cat.id)

  // Save Book to DB
  const book = await prisma.book.create({
    data: {
      title,
      author,
      language,
      coverImage: coverImageUrl,
      smallDescription,
      content,
      pageCount,
      audioLink,
      relatedInfo,
      layout,
      images: { set: imageUrls },
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
  })

  updateBooksCache(null)

  return NextResponse.json(book, { status: 201 })
}
// POST /api/books
// export async function POST(request) {
//   const formData = await request.formData();
//   const title = formData.get('title');
//   const author = formData.get('author');
//   const language = formData.get('language');
//   const smallDescription = formData.get('smallDescription');
//   const content = formData.get('content');
//   const pageCount = parseInt(formData.get('pageCount')) || null;
//   const audioLink = formData.get('audioLink');
//   const relatedInfo = formData.get('relatedInfo');
//   const layout = formData.get('layout') || 'MIXED';
//   const categoryNames = formData.getAll('categoryNames');
//   const coverImageFile = formData.get('coverImage');
//   const imageFiles = formData.getAll('images');
//   let contentBlocks = [];
//   try {
//     const raw = formData.get('contentBlocks');
//     contentBlocks = raw ? JSON.parse(raw) : [];
//   } catch (e) {
//     return NextResponse.json({ error: 'Invalid contentBlocks format' }, { status: 400 });
//   }

//   // Upload Cover Image
//   let coverImageUrl = null;
//   if (coverImageFile && coverImageFile.size > 0) {
//     coverImageUrl = await saveImage(coverImageFile);
//   }

//   // Upload Multiple Images
//   let imageUrls = [];
//   for (const file of imageFiles) {
//     if (file && file.size > 0) {
//       const url = await saveImage(file);
//       imageUrls.push(url);
//     }
//   }

//   // Ensure categories exist — create missing ones
//   const existingCategories = await prisma.category.findMany({
//     where: { name: { in: categoryNames } },
//   });
//   const existingNames = existingCategories.map(cat => cat.name);
//   const newNames = categoryNames.filter(name => !existingNames.includes(name));
//   let newCategories = [];
//   if (newNames.length > 0) {
//     newCategories = await prisma.category.createManyAndReturn({
//       data: newNames.map(name => ({ name })),
//     });
//   }
//   const allCategories = [...existingCategories, ...newCategories];
//   const categoryIds = allCategories.map(cat => cat.id);

//   // Save Book to DB
//   const book = await prisma.book.create({
//     data: {
//       title,
//       author,
//       language,
//       coverImage: coverImageUrl,
//       smallDescription,
//       content,
//       pageCount,
//       audioLink,
//       relatedInfo,
//       layout,
//       images: { set: imageUrls },
//       categories: {
//         connect: categoryIds.map(id => ({ id })),
//       },
//       contentBlocks: {
//         create: contentBlocks.map(block => ({
//           type: block.type,
//           content: block.content,
//           order: block.order,
//         })),
//       },
//     },
//     include: {
//       categories: true,
//       contentBlocks: true,
//     },
//   });

//   // Clear cache
//   updateBooksCache(null);

//   return NextResponse.json(book, { status: 201 });
// }