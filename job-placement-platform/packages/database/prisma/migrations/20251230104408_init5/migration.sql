-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "isMockInterviewsPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTailoringPremium" BOOLEAN NOT NULL DEFAULT false;
