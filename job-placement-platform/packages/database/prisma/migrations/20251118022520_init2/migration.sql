/*
  Warnings:

  - You are about to drop the column `companyId` on the `Users` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Companies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_companyId_fkey";

-- DropIndex
DROP INDEX "Users_companyId_key";

-- AlterTable
ALTER TABLE "Companies" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "companyId";

-- AddForeignKey
ALTER TABLE "Companies" ADD CONSTRAINT "Companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
