
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const repo = await prisma.repository.findFirst({
    where: { fullName: { contains: "freeCodeCamp", mode: "insensitive" } },
    include: {
      _count: {
        select: { contributors: true }
      }
    }
  });

  if (!repo) {
    console.log("❌ Repo not found in DB.");
  } else {
    console.log(`📊 Repo: ${repo.fullName}`);
    console.log(`📡 Status: ${repo.status}`);
    console.log(`📝 Message: ${repo.statusMessage}`);
    console.log(`👥 Contributors Processed: ${repo._count.contributors}`);
  }
  process.exit(0);
}

check();
