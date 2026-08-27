import { Command } from 'commander';
import { PrismaClient } from '@prisma/client';
import { GtfsStaticSource } from '../sources/gtfs.static.source';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();
const prisma = new PrismaClient();

program
  .name('transit:refresh')
  .description('Refresh transit data from configured sources')
  .option('--source <name>', 'Specific source to refresh (default: all)')
  .option('--dry-run', 'Validate without persisting', false);

program.parse();

const options = program.opts();

async function main() {
  const sources = [
    {
      name: 'transjakarta',
      url: 'https://ppid.transjakarta.co.id/informasi/berkala/gtfs',
      fetchDir: './data/gtfs/transjakarta',
      license: 'CC BY 4.0',
    },
  ];

  const toRefresh = options.source
    ? sources.filter(s => s.name === options.source)
    : sources;

  if (toRefresh.length === 0) {
    console.error(`Source not found: ${options.source}`);
    process.exit(1);
  }

  for (const src of toRefresh) {
    console.log(`\n=== Refreshing ${src.name} ===`);
    
    if (!fs.existsSync(src.fetchDir)) {
      console.error(`Fetch directory not found: ${src.fetchDir}`);
      continue;
    }

    const source = new GtfsStaticSource(src, prisma);
    const metadata = source.metadata();
    console.log(`Source: ${metadata.name}`);
    console.log(`URL: ${metadata.url}`);
    console.log(`License: ${metadata.license}`);

    const report = await source.ingest({
      workdir: src.fetchDir,
      dryRun: options.dryRun,
      version: new Date().toISOString().split('T')[0],
    });

    console.log(`Status: ${report.status}`);
    if (report.status === 'SUCCESS') {
      console.log(`Records ingested: ${JSON.stringify(report.recordsAccepted)}`);
    } else {
      console.error(`Error: ${report.error}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
