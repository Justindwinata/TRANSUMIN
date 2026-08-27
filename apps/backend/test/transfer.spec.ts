import { PrismaClient } from '@prisma/client';
import { RoutingEngine } from '../src/modules/routing/routing.service';

const prisma = new PrismaClient();

describe('Cross-Operator Transfer Feasibility', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should have transfer records with operator metadata', async () => {
    const transfers = await prisma.transfer.findMany({
      select: {
        fromStopId: true,
        toStopId: true,
        fromOperator: true,
        toOperator: true,
        walkDistance: true,
        minTransferTime: true,
        source: true,
        confidence: true,
      },
    });

    expect(transfers.length).toBeGreaterThan(0);

    const withOperatorFields = transfers.filter(
      t => t.fromOperator !== null || t.toOperator !== null
    );
    expect(withOperatorFields.length).toBeGreaterThan(0);
  });

  it('should have intra-operator transfers from shape proximity', async () => {
    const intraTransfers = await prisma.transfer.findMany({
      where: {
        fromOperator: 'transjakarta',
        toOperator: 'transjakarta',
      },
    });
    expect(intraTransfers.length).toBeGreaterThan(0);
  });

  it('should have valid walk distances', async () => {
    const transfers = await prisma.transfer.findMany({
      where: { walkDistance: { not: null } },
    });

    for (const t of transfers) {
      expect(t.walkDistance).toBeLessThanOrEqual(300);
      expect(t.walkDistance).toBeGreaterThan(0);
    }
  });

  it('should have minTransferTime >= 300s', async () => {
    const transfers = await prisma.transfer.findMany();
    for (const t of transfers) {
      if (t.minTransferTime !== null) {
        expect(t.minTransferTime).toBeGreaterThanOrEqual(300);
      }
    }
  });

  it('should have confidence scores between 0 and 1', async () => {
    const transfers = await prisma.transfer.findMany({
      where: { confidence: { not: null } },
    });

    for (const t of transfers) {
      expect(t.confidence).toBeGreaterThanOrEqual(0);
      expect(t.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('should have source field populated', async () => {
    const transfers = await prisma.transfer.findMany({
      select: { source: true },
    });

    const sources = [...new Set(transfers.map(t => t.source))];
    expect(sources).toContain('gtfs');
    expect(sources).toContain('shape_proximity');
  });
});
