/*
  Warnings:

  - You are about to drop the column `deletedById` on the `Role` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_deletedById_fkey";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "deletedById",
ALTER COLUMN "description" DROP DEFAULT;
