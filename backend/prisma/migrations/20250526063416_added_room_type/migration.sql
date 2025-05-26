-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('public', 'private');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "type" "RoomType" NOT NULL DEFAULT 'public';
