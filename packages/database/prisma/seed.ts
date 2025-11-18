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

export default async function seed() {
  for (const role of roles) {
    await prisma.roles.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
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