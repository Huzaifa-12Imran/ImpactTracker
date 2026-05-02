const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const repo = await prisma.repository.findUnique({
    where: { fullName: 'Huzaifa-12Imran/ImpactTracker' },
    include: {
      contributors: true,
    }
  });
  
  if (!repo) {
    console.log('Repo not found');
    return;
  }
  
  console.log('Repo FullName:', repo.fullName);
  console.log('Contributors:', repo.contributors.length);
  for (const c of repo.contributors) {
    console.log(`- ${c.githubLogin}: Raw="${c.rawLocation}", Resolved="${c.resolvedCountry}"`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
