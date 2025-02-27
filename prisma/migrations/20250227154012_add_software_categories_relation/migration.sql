/*
  Warnings:

  - You are about to drop the column `category` on the `Software` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Software` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Software" DROP COLUMN "category",
DROP COLUMN "type",
ADD COLUMN     "alternatives" TEXT,
ADD COLUMN     "features" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "types" TEXT[],
ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "shortDescription" DROP NOT NULL,
ALTER COLUMN "available" SET DEFAULT true;

-- CreateTable
CREATE TABLE "SoftwareCategory" (
    "softwareId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "SoftwareCategory_pkey" PRIMARY KEY ("softwareId","categoryId")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");

-- AddForeignKey
ALTER TABLE "SoftwareCategory" ADD CONSTRAINT "SoftwareCategory_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareCategory" ADD CONSTRAINT "SoftwareCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
