-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "CommunicationScore" INTEGER,
ADD COLUMN     "DepthOfKnowledgeScore" INTEGER,
ADD COLUMN     "JobRelevanceScore" INTEGER,
ADD COLUMN     "OverallHiringScore" INTEGER,
ADD COLUMN     "ProblemSolvingScore" INTEGER,
ADD COLUMN     "strengths" TEXT,
ADD COLUMN     "technicalScore" INTEGER,
ADD COLUMN     "weaknesses" TEXT;
