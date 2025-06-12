import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { saveImage } from '@/utils/saveImage';
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
// export async function POST(request) {
//   try {
//     // const body = await request.json();

//     // const {
//     //   title,
//     //   author,
//     //   language,
//     //   coverImage,
//     //   smallDescription,
//     //   content,
//     //   pageCount,
//     //   audioLink,
//     //   relatedInfo,
//     //   categoryNames = [],
//     //   layout = "MIXED",
//     //   contentBlocks = [],
//     //   images=[]
//     // } = body;
//     const formData = await request.formData();

//     const title = formData.get("title");
//     const author = formData.get("author");
//     const language = formData.get("language");
//     const coverImage = formData.get("coverImage");
//     const smallDescription = formData.get("smallDescription");
//     const content = formData.get("content");
//     const pageCount = formData.get("pageCount");
//     const audioLink = formData.get("audioLink");
//     const relatedInfo = formData.get("relatedInfo");
//     const layout = formData.get("layout");
//     const categoryNames = formData.getAll("categoryNames");
//     const images = formData.getAll("images");
//     let contentBlocks = [];
//     try {
//       const raw = formData.get("contentBlocks");
//       contentBlocks = raw ? JSON.parse(raw) : [];
//     } catch (e) {
//       console.error("Invalid contentBlocks JSON", e);
//       return NextResponse.json({ error: "Invalid contentBlocks format" }, { status: 400 });
//     }


//     if (!title || !author || !language) {
//       return NextResponse.json(
//         { error: 'Missing required fields: title, author, or language' },
//         { status: 400 }
//       );
//     }

//     // Ensure categories exist — create missing ones
//     const existingCategories = await prisma.category.findMany({
//       where: { name: { in: categoryNames } },
//     });

//     const existingNames = existingCategories.map(cat => cat.name);
//     const newNames = categoryNames.filter(name => !existingNames.includes(name));

//     let newCategories = [];
//     if (newNames.length > 0) {
//       newCategories = await prisma.category.createManyAndReturn({
//         data: newNames.map(name => ({ name })),
//       });
//     }

//     const allCategories = [...existingCategories, ...newCategories];
//     const categoryIds = allCategories.map(cat => cat.id);

//     const book = await prisma.book.create({
//       data: {
//         title,
//         author,
//         language,
//         coverImage,
//         smallDescription,
//         content,
//         pageCount: pageCount ? parseInt(pageCount) : null,
//         audioLink,
//         relatedInfo,
//         layout,
//         images: { set: images },
//         categories: {
//           connect: categoryIds.map(id => ({ id })),
//         },
//         contentBlocks: {
//           create: contentBlocks.map(block => ({
//             type: block.type,
//             content: block.content,
//             order: block.order,
//           })),
//         },
//       },
//       include: {
//         categories: true,
//         contentBlocks: true,
//       },
//     });

//     return NextResponse.json(book, { status: 201 });
//   } catch (error) {
//     console.error('Error creating book:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

export async function POST(request) {
  const formData = await request.formData();

  const title = formData.get('title');
  const author = formData.get('author');
  const language = formData.get('language');
  const smallDescription = formData.get('smallDescription');
  const content = formData.get('content');
  const pageCount = parseInt(formData.get('pageCount')) || null;
  const audioLink = formData.get('audioLink');
  const relatedInfo = formData.get('relatedInfo');
  const layout = formData.get('layout') || 'MIXED';
  const categoryNames = formData.getAll('categoryNames');
  const coverImageFile = formData.get('coverImage');
  const imageFiles = formData.getAll('images');

  let contentBlocks = [];
  try {
    const raw = formData.get('contentBlocks');
    contentBlocks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    return NextResponse.json({ error: 'Invalid contentBlocks format' }, { status: 400 });
  }

  // Upload Cover Image
  let coverImageUrl = null;
  if (coverImageFile && coverImageFile.size > 0) {
    coverImageUrl = await saveImage(coverImageFile);
  }

  // Upload Multiple Images
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
  });

  return NextResponse.json(book, { status: 201 });
}