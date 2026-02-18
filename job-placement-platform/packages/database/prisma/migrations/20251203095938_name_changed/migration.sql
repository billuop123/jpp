/*
  Warnings:

  - You are about to drop the column `CommunicationScore` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `DepthOfKnowledgeScore` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `JobRelevanceScore` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `OverallHiringScore` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `ProblemSolvingScore` on the `applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "CommunicationScore",
DROP COLUMN "DepthOfKnowledgeScore",
DROP COLUMN "JobRelevanceScore",
DROP COLUMN "OverallHiringScore",
DROP COLUMN "ProblemSolvingScore",
ADD COLUMN     "communicationScore" INTEGER,
ADD COLUMN     "depthOfKnowledgeScore" INTEGER,
ADD COLUMN     "jobRelevanceScore" INTEGER,
ADD COLUMN     "problemSolvingScore" INTEGER;
