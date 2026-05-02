const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const contributors = await prisma.contributor.findMany({
    select: {
      githubLogin: true,
      rawLocation: true,
      resolvedCountry: true,
    }
  });
  console.log('Contributors:', JSON.stringify(contributors, null, 2));
  
  const repos = await prisma.repository.findMany({
    select: {
      fullName: true,
      hasIssueTemplate: true,
      hasPullRequestTemplate: true,
      healthPercentage: true,
    }
  });
  console.log('Repos:', JSON.stringify(repos, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
