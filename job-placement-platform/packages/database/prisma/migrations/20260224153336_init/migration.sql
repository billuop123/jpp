-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "acceptanceEmailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejectionEmailSent" BOOLEAN NOT NULL DEFAULT false;
