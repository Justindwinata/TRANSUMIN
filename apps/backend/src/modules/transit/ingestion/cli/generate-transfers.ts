import { Command } from 'commander';
import { PrismaClient } from '@prisma/client';
import { TransferGenerator } from '../transfer.generator';

const program = new Command();
const prisma = new PrismaClient();

program
  .name('transit:generate-transfers')
  .description('Generate cross-operator and intra-operator transfers')
  .option('--max-distance <meters>', 'Maximum walk distance for transfers', '300')
  .option('--min-time <seconds>', 'Minimum transfer time', '300')
  .option('--source <type>', 'Transfer source type', 'proximity')
  .option('--intra-only', 'Generate only intra-operator transfers', false);

program.parse();

const options = program.opts();

async function main() {
  console.log('=== Transfer Generation ===');
  console.log(`Max distance: ${options.maxDistance}m`);
  console.log(`Min time: ${options.minTime}s`);
  console.log(`Source: ${options.source}`);
  console.log(`Intra-only: ${options.intraOnly}`);

  const generator = new TransferGenerator(prisma);

  let totalTransfers = 0;

  if (!options.intraOnly) {
    console.log('\nGenerating cross-operator transfers...');
    const crossTransfers = await generator.generateCrossOperatorTransfers({
      maxWalkDistanceMeters: parseInt(options.maxDistance, 10),
      minTransferTimeSeconds: parseInt(options.minTime, 10),
      source: options.source,
    });
    totalTransfers += crossTransfers;
    console.log(`Cross-operator transfers: ${crossTransfers}`);
  }

  console.log('\nGenerating intra-operator transfers from shapes...');
  const intraTransfers = await generator.generateIntraOperatorTransfersFromShape();
  totalTransfers += intraTransfers;
  console.log(`Intra-operator transfers: ${intraTransfers}`);

  console.log(`\nTotal transfers generated: ${totalTransfers}`);

  const count = await prisma.transfer.count();
  console.log(`Total transfers in database: ${count}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
