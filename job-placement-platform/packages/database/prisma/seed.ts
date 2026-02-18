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

const sampleJobs = [
  {
    title: "Software Engineer",
    description:
      "Join our team as a Software Engineer working with modern web technologies.",
    location: "Remote",
    isRemote: true,
    skills: ["TypeScript", "Node.js", "React"],
  },
  {
    title: "Product Manager",
    description:
      "Drive product strategy, roadmap, and delivery in a fast-paced environment.",
    location: "Hybrid - San Francisco, CA",
    isRemote: false,
    skills: ["Product Management", "Agile", "Communication"],
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
  await prisma.applicationstatus.upsert({
    where: { code: "PENDING" },
    update: { name: "PENDING" },
    create: { name: "PENDING", code: "PENDING" },
  })
  await prisma.applicationstatus.upsert({
    where: { code: "GRANTED" },
    update: { name: "GRANTED" },
    create: { name: "GRANTED", code: "GRANTED" },
  })

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

  // Seed example jobs for companies that don't have any yet
  const jobTypesInDb = await prisma.jobtypes.findMany({
    select: { id: true, name: true },
  });

  if (jobTypesInDb.length === 0) {
    console.warn("No job types found – skipping job seeding.");
    return;
  }

  const defaultJobTypeId =
    jobTypesInDb.find((jt) => jt.name === "full-time")?.id ??
    jobTypesInDb[0]?.id;

  for (const company of companies) {
    const existingJob = await prisma.jobs.findFirst({
      where: { companyId: company.id },
    });

    // Keep seed idempotent – don't add jobs if this company already has any
    if (existingJob) continue;

    await prisma.jobs.createMany({
      data: sampleJobs.map((job) => ({
        title: job.title,
        description: job.description,
        companyId: company.id,
        jobtypeId: defaultJobTypeId,
        location: job.location,
        isRemote: job.isRemote,
        skills: job.skills,
      })),
    });
  }
}
async function createUsers() {
  const usersToCreate: { email: string; roleCode: string }[] = [
    { email: "biplovthapa890@gmail.com", roleCode: "RECRUITER" },
    { email: "biplovthapa80@gmail.com", roleCode: "CANDIDATE" },
    { email: "biplovthapa456@gmail.com", roleCode: "ADMIN" },
  ];

  for (const { email, roleCode } of usersToCreate) {
    // Skip if user already exists (idempotent)
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) continue;

    const role = await prisma.roles.findUnique({
      where: { code: roleCode },
    });

    if (!role) {
      console.warn(`Role with code ${roleCode} not found, skipping user ${email}`);
      continue;
    }

    await prisma.users.create({
      data: {
        email,
        name: email.split("@")[0],
        password: Math.random().toString(36).substring(2, 15),
        role: {
          connect: {
            id: role.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }
}

if (require.main === module) {
  (async () => {
    try {
      await seed();
      await createUsers();
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Failed to seed database:", error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  })();
}