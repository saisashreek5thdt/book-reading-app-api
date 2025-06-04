-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('TEXT', 'IMAGE');

-- CreateEnum
CREATE TYPE "LayoutType" AS ENUM ('FULL_TEXT', 'IMAGE_TOP_TEXT_BOTTOM', 'TEXT_TOP_IMAGE_BOTTOM', 'MIXED');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "layout" "LayoutType" NOT NULL DEFAULT 'MIXED',
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "fullName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" SERIAL NOT NULL,
    "type" "BlockType" NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
