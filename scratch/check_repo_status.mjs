import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const repo = await prisma.repository.findUnique({
    where: { fullName: 'Huzaifa-12Imran/AI-Portfolio' },
    include: { impactScores: true }
  });
  console.log(JSON.stringify(repo, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
