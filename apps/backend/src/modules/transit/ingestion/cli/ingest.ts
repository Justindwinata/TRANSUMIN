import { Command } from 'commander';
import { PrismaClient } from '@prisma/client';
import { GtfsIngestionPipeline } from '../gtfs.ingestion';

const program = new Command();
const prisma = new PrismaClient();

program
  .name('transit:ingest')
  .description('GTFS transit data ingestion CLI')
  .requiredOption('--source <name>', 'Source name (e.g., transjakarta)')
  .requiredOption('--version <version>', 'Dataset version identifier')
  .requiredOption('--fetch-dir <path>', 'Directory containing extracted GTFS files')
  .option('--url <url>', 'Source URL')
  .option('--license <license>', 'License identifier')
  .option('--dry-run', 'Validate without persisting', false);

program.parse();

const options = program.opts();

async function main() {
  const pipeline = new GtfsIngestionPipeline(prisma);
  const report = await pipeline.run({
    sourceName: options.source,
    sourceUrl: options.url ?? '',
    sourceLicense: options.license,
    version: options.version,
    dryRun: options.dryRun,
    fetchDir: options.fetchDir,
  });

  console.log('=== INGESTION REPORT ===');
  console.log(JSON.stringify(report, null, 2));

  if (report.status === 'FAILED') {
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });