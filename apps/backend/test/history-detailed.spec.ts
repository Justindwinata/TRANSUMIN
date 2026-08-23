import { HistoryService } from '../src/modules/history/history.service';
import { PrismaClient, JourneyHistory } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('HistoryService detailed regression', () => {
  let service: HistoryService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = {
      journeyHistory: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    } as any;

    service = new HistoryService(prisma);
  });

  const mockEntry = (overrides: Partial<JourneyHistory> = {}): JourneyHistory => ({
    id: 'hist-1',
    userId: 'user-1',
    originName: 'Home',
    destName: 'Office',
    summaryJson: '{"routes":[]}',
    createdAt: new Date(),
    ...overrides,
  });

  describe('create - max limit enforcement', () => {
    it('should not delete any entries when under the limit', async () => {
      const existing = [mockEntry({ id: 'e1' }), mockEntry({ id: 'e2' })];
      (prisma.journeyHistory.create as jest.Mock).mockResolvedValue(mockEntry({ id: 'new' }));
      (prisma.journeyHistory.findMany as jest.Mock).mockResolvedValue([...existing, mockEntry({ id: 'new' })]);

      await service.create('user-1', 'A', 'B', '{}');
      expect(prisma.journeyHistory.deleteMany).not.toHaveBeenCalled();
    });

    it('should delete excess entries when over the limit', async () => {
      const entries = Array.from({ length: 60 }, (_, i) =>
        mockEntry({ id: `e-${i}`, createdAt: new Date(Date.now() - i * 1000) })
      );
      (prisma.journeyHistory.create as jest.Mock).mockResolvedValue(mockEntry({ id: 'new' }));
      (prisma.journeyHistory.findMany as jest.Mock).mockResolvedValue([...entries, mockEntry({ id: 'new' })]);

      await service.create('user-1', 'A', 'B', '{}');
      expect(prisma.journeyHistory.deleteMany).toHaveBeenCalled();
    });
  });

  describe('ordering', () => {
    it('should return history ordered by createdAt desc', async () => {
      const mockEntries = [
        mockEntry({ id: 'h2', createdAt: new Date('2024-01-02') }),
        mockEntry({ id: 'h1', createdAt: new Date('2024-01-03') }),
      ];
      (prisma.journeyHistory.findMany as jest.Mock).mockResolvedValue(mockEntries);

      await service.list('user-1', 10);
      expect(prisma.journeyHistory.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });
  });

  describe('duplicate handling', () => {
    it('allows multiple entries with same origin/dest (no deduplication on backend)', async () => {
      const e1 = mockEntry({ id: 'h1' });
      const e2 = mockEntry({ id: 'h2' });
      (prisma.journeyHistory.findMany as jest.Mock).mockResolvedValue([e1, e2]);

      const result = await service.list('user-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('get - missing entry', () => {
    it('throws NotFoundException if history entry does not exist', async () => {
      (prisma.journeyHistory.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.get('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove - ownership', () => {
    it('allows removing own entry', async () => {
      (prisma.journeyHistory.findUnique as jest.Mock).mockResolvedValue(mockEntry());
      (prisma.journeyHistory.delete as jest.Mock).mockResolvedValue(mockEntry());

      const result = await service.remove('user-1', 'hist-1');
      expect(result.success).toBe(true);
    });

    it('forbids removing another users entry', async () => {
      (prisma.journeyHistory.findUnique as jest.Mock).mockResolvedValue(mockEntry({ userId: 'attacker' }));
      await expect(service.remove('user-1', 'hist-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
