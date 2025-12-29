import { config } from "dotenv";
import path from "path";
import { PrismaClient } from "../generated/prisma/client";

config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const roles = [
  { name: "Admin", code: "ADMIN" },
  { name: "Recruiter", code: "RECRUITER" },
  { name: "Candidate", code: "CANDIDATE" },
];

const jobTypes = [
  { name: "full-time", description: "Full-time employment" },
  { name: "part-time", description: "Part-time employment" },
  { name: "contract", description: "Contract-based role" },
  { name: "internship", description: "Internship or trainee position" },
  { name: "freelance", description: "Freelance or consulting engagement" },
];

const companyTypes = [
  { name: "Startup", description: "Early-stage or growth-stage company" },
  { name: "SME", description: "Small or medium-sized enterprise" },
  { name: "Enterprise", description: "Large established organization" },
  { name: "Agency", description: "Recruitment, consulting, or creative agency" },
  { name: "Non-profit", description: "Non-governmental or non-profit organization" },
];

const emailTemplates = [
  {
    name: "Application Received",
    code: "APPLICATION_RECEIVED",
    subject: "We have received your application",
    body: "Hi {{candidateName}},\n\nWe have received your application for {{jobTitle}} at {{companyName}}. Our team will review your profile and get back to you shortly.\n\nBest regards,\n{{companyName}}",
    description: "Sent to a candidate when they apply for a job.",
  },
  {
    name: "Application Shortlisted",
    code: "APPLICATION_SHORTLISTED",
    subject: "Your application has been shortlisted",
    body: "Hi {{candidateName}},\n\nGood news! Your application for {{jobTitle}} at {{companyName}} has been shortlisted. We will contact you soon with next steps.\n\nBest regards,\n{{companyName}}",
    description: "Sent when an application is shortlisted.",
  },
  {
    name: "Application Rejected",
    code: "APPLICATION_REJECTED",
    subject: "Update on your application",
    body: "Hi {{candidateName}},\n\nThank you for your interest in {{jobTitle}} at {{companyName}}. After careful consideration, we will not be moving forward with your application at this time.\n\nWe appreciate the time you took to apply and encourage you to apply for future roles.\n\nBest regards,\n{{companyName}}",
    description: "Sent when an application is rejected.",
  },
];

const companySettingsDefaults = [
  {
    key: "ALLOW_APPLICATION_EMAILS",
    value: true,
    isSystemSetting: true,
  },
  {
    key: "ALLOW_STATUS_UPDATE_EMAILS",
    value: true,
    isSystemSetting: true,
  },
];

export default async function seed() {
  for (const role of roles) {
    await prisma.roles.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
  }

  // Seed job types if not already present (by name)
  for (const jobType of jobTypes) {
    const existing = await prisma.jobtypes.findFirst({
      where: { name: jobType.name },
    });
    if (!existing) {
      await prisma.jobtypes.create({ data: jobType });
    }
  }

  // Seed company types if not already present (by name)
  for (const companyType of companyTypes) {
    const existing = await prisma.companyTypes.findFirst({
      where: { name: companyType.name },
    });
    if (!existing) {
      await prisma.companyTypes.create({ data: companyType });
    }
  }

  // Seed email templates using upsert on unique code
  for (const template of emailTemplates) {
    await prisma.emailTemplates.upsert({
      where: { code: template.code },
      update: {
        name: template.name,
        subject: template.subject,
        body: template.body,
        description: template.description,
      },
      create: template,
    });
  }

  // Seed default company settings for all existing companies, per key
  const companies = await prisma.companies.findMany({
    select: { id: true },
  });

  for (const company of companies) {
    for (const setting of companySettingsDefaults) {
      const existingSetting = await prisma.companySettings.findFirst({
        where: {
          companyId: company.id,
          key: setting.key,
        },
      });

      if (!existingSetting) {
        await prisma.companySettings.create({
          data: {
            companyId: company.id,
            key: setting.key,
            value: setting.value,
            isSystemSetting: setting.isSystemSetting,
          },
        });
      }
    }
  }
}

if (require.main === module) {
  seed()
    .then(() => prisma.$disconnect())
    .then(() => console.log("Database seeded successfully"))
    .catch(async (error) => {
      console.error("Failed to seed database:", error);
      await prisma.$disconnect();
      process.exit(1);
    });
}