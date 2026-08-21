import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const kai = await prisma.agency.upsert({
    where: { id: 'kai-commuter' },
    update: {},
    create: {
      id: 'kai-commuter',
      name: 'KAI Commuter',
      shortName: 'KRL',
      authority: 'PT KAI Commuter Jabodetabek',
      website: 'https://www.commuterline.id',
    },
  });

  const tj = await prisma.agency.upsert({
    where: { id: 'transjakarta' },
    update: {},
    create: {
      id: 'transjakarta',
      name: 'TransJakarta',
      shortName: 'TJ',
      authority: 'PT Transportasi Jakarta',
      website: 'https://transjakarta.co.id',
    },
  });

  console.log('Database seeded with agencies:', { kai, tj });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
