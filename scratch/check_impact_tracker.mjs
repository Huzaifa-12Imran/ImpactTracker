import { prisma } from "../apps/api/src/lib/prisma.js";

async function main() {
  const repo = await prisma.repository.findUnique({
    where: { fullName: 'Huzaifa-12Imran/ImpactTracker' }
  });
  console.log('README Length:', repo.readmeContent?.length ?? 'NULL');
  console.log('Status Message:', repo.statusMessage);
  console.log('Status:', repo.status);
}

main().catch(console.error).finally(() => prisma.$disconnect());
