
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function migrate() {
  console.log("🚀 Starting database migration...");
  const repos = await prisma.repository.findMany();
  
  for (const repo of repos) {
    const lowerName = repo.fullName.toLowerCase();
    if (repo.fullName !== lowerName) {
      console.log(`Updating ${repo.fullName} -> ${lowerName}`);
      await prisma.repository.update({
        where: { id: repo.id },
        data: { fullName: lowerName }
      });
    }
  }
  
  console.log("✅ Migration complete!");
  process.exit(0);
}

migrate().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
