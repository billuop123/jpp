/*
  Warnings:

  - A unique constraint covering the columns `[jobId,userId]` on the table `applications` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserDetails" ADD COLUMN     "finished" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "applications_jobId_userId_key" ON "applications"("jobId", "userId");
