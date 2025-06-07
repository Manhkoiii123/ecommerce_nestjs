-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "deletedById" INTEGER,
ALTER COLUMN "description" SET DEFAULT '';

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
CREATE UNIQUE INDEX "Role_name_unique" 
ON "Role" (name)
WHERE "deletedAt" IS NULL