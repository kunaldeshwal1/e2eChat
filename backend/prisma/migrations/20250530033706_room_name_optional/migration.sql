-- DropIndex
DROP INDEX "Room_name_key";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "name" DROP NOT NULL;
