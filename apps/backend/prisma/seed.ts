import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const kai = await prisma.agency.upsert({
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

  const krl = await prisma.agency.upsert({
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

  // Create reference stations
  const jakartaKotaStation = await prisma.station.upsert({
    where: { id: 'station-jakarta-kota' },
    update: {},
    create: {
      id: 'station-jakarta-kota',
      name: 'Stasiun Jakarta Kota',
      lat: -6.175,
      lon: 106.8272,
      operator: 'KAI Commuter',
    },
  });

  const monasStation = await prisma.station.upsert({
    where: { id: 'station-monas' },
    update: {},
    create: {
      id: 'station-monas',
      name: 'Stasiun Monumen Nasional',
      lat: -6.1751,
      lon: 106.8241,
      operator: 'TransJakarta',
    },
  });

  // Create reference stops within stations
  await prisma.stop.upsert({
    where: { id: 'transjakarta-stop-monas' },
    update: {},
    create: {
      id: 'transjakarta-stop-monas',
      agencyId: 'transjakarta',
      name: 'Monumen Nasional',
      lat: -6.1751,
      lon: 106.8241,
      stationId: 'station-monas',
    },
  });

  await prisma.stop.upsert({
    where: { id: 'kai-stop-jakarta-kota' },
    update: {},
    create: {
      id: 'kai-stop-jakarta-kota',
      agencyId: 'kai-commuter',
      name: 'Stasiun Jakarta Kota',
      lat: -6.175,
      lon: 106.8272,
      stationId: 'station-jakarta-kota',
    },
  });

  console.log('Database seeded with agencies:', { kai, krl, jakartaKota: jakartaKotaStation, monas: monasStation });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
