import { PrismaClient } from '@prisma/client';
import { IngestionReport } from './gtfs.types';

export class DatasetRegistry {
  constructor(private prisma: PrismaClient) {}

  async registerDataSource(name: string, url: string, license: string | null) {
    return this.prisma.dataSource.upsert({
      where: { id: name },
      update: {},
      create: { id: name, name, url, license, lastFetchedAt: new Date() },
    });
  }

  async createDatasetVersion(sourceName: string, version: string) {
    const source = await this.prisma.dataSource.findUnique({ where: { id: sourceName } });
    if (!source) throw new Error(`Source not found: ${sourceName}`);
    return this.prisma.datasetVersion.create({
      data: { sourceId: source.id, version, isActive: false },
    });
  }

  async activateDataset(datasetId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.datasetVersion.updateMany({ data: { isActive: false } });
      await tx.datasetVersion.update({ where: { id: datasetId }, data: { isActive: true } });
    });
  }

  async listDatasets() {
    return this.prisma.datasetVersion.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
