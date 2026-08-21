import { Command } from 'commander';
import { PrismaClient } from '@prisma/client';
import { DatasetRegistry } from './dataset.registry';
import * as fs from 'fs';

const program = new Command();
const prisma = new PrismaClient();

program
  .name('transit:list-datasets')
  .description('List all dataset versions and their activation status');

program.parse();

async function main() {
  const registry = new DatasetRegistry(prisma);
  const datasets = await registry.listDatasets();
  if (datasets.length === 0) {
    console.log('No datasets ingested yet.');
    process.exit(0);
  }
  console.log('Dataset Versions:');
  console.log(JSON.stringify(datasets, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });