import { PrismaClient } from "@impact/database";
const prisma = new PrismaClient();

async function main() {
  const repo = await prisma.repository.findUnique({
    where: { fullName: 'Huzaifa-12Imran/ImpactTracker' }
  });
  if (repo) {
    await prisma.impactScore.deleteMany({
      where: { repositoryId: repo.id }
    });
    console.log('Deleted impact scores for:', repo.fullName);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
