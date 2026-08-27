import { Command } from 'commander';
import { PrismaClient } from '@prisma/client';
import { TransferGenerator } from '../transfer.generator';

const program = new Command();
const prisma = new PrismaClient();

program
  .name('transit:generate-transfers')
  .description('Generate cross-operator and intra-operator transfers with quality gates')
  .option('--max-distance <meters>', 'Maximum walk distance for transfers', '300')
  .option('--min-time <seconds>', 'Minimum transfer time', '300')
  .option('--source <type>', 'Transfer source type', 'proximity')
  .option('--prune-only', 'Only prune invalid transfers, do not generate new ones', false);

program.parse();

const options = program.opts();

async function main() {
  console.log('=== Transfer Generation with Quality Gates ===');
  console.log(`Max distance: ${options.maxDistance}m`);
  console.log(`Min time: ${options.minTime}s`);
  console.log(`Source: ${options.source}`);
  console.log(`Prune only: ${options.pruneOnly}`);

  const generator = new TransferGenerator(prisma);

  let totalTransfers = 0;

  // First, prune invalid transfers
  console.log('\nPruning invalid transfers...');
  const pruned = await generator.pruneInvalidTransfers(
    parseInt(options.maxDistance, 10),
    parseInt(options.minTime, 10)
  );
  console.log(`Pruned ${pruned} invalid transfers`);

  if (!options.pruneOnly) {
    console.log('\nGenerating transfers with quality gates...');
    const generated = await generator.generateTransfers({
      maxWalkDistanceMeters: parseInt(options.maxDistance, 10),
      minTransferTimeSeconds: parseInt(options.minTime, 10),
      source: options.source,
    });
    totalTransfers = generated;
    console.log(`Generated ${generated} new transfers (including pruned)`);
  } else {
    totalTransfers = 0;
  }

  // Generate same-station transfers (always run)
  console.log('\nGenerating same-station transfers...');
  const sameStation = await generator.generateSameStationTransfers();
  console.log(`Generated ${sameStation} same-station transfers`);
  totalTransfers += sameStation;

  // Generate intra-operator transfers from shapes
  console.log('\nGenerating intra-operator transfers from shapes...');
  const intra = await generator.generateIntraOperatorTransfersFromShape();
  console.log(`Generated ${intra} intra-operator transfers`);
  totalTransfers += intra;

  const count = await prisma.transfer.count();
  console.log(`\nTotal transfers in database: ${count}`);

  // Summary
  console.log('\n=== Transfer Quality Summary ===');
  const stats = await prisma.transfer.groupBy({
    by: ['source'],
    _count: true,
  });
  for (const s of stats) {
    console.log(`${s.source}: ${s._count}`);
  }

  const over300 = await prisma.transfer.count({
    where: { walkDistance: { gt: 300 } },
  });
  console.log(`\nTransfers over 300m: ${over300}`);

  const underMinTime = await prisma.transfer.count({
    where: { minTransferTime: { lt: 300 } },
  });
  console.log(`Transfers under 300s min time: ${underMinTime}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
