-- CreateEnum
CREATE TYPE "public"."ImageType" AS ENUM ('URL', 'FILE');

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "imageFile" TEXT,
ADD COLUMN     "imageType" "public"."ImageType",
ALTER COLUMN "imageUrl" DROP NOT NULL;
