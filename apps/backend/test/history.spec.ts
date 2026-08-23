import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from '../src/modules/history/history.service';
import { PrismaClient, JourneyHistory } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('HistoryService', () => {
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
        count: jest.fn(),
      },
    } as any;

    service = new HistoryService(prisma);
  });

  const mockEntry: JourneyHistory = {
    id: 'hist-1',
    userId: 'user-1',
    originName: 'Home',
    destName: 'Office',
    summaryJson: '{"routes":[]}',
    createdAt: new Date(),
  };

  describe('create', () => {
    it('should create a history entry', async () => {
      (prisma.journeyHistory.create as jest.Mock).mockResolvedValue(mockEntry);
      (prisma.journeyHistory.findMany as jest.Mock).mockResolvedValue([mockEntry]);

      const result = await service.create('user-1', 'Home', 'Office', '{}');
      expect(result.id).toBe('hist-1');
    });

    it('should enforce max history limit', async () => {
      const entries = Array.from({ length: 60 }, (_, i) => ({
        id: `hist-${i}`,
        userId: 'user-1',
        originName: 'A',
        destName: 'B',
        summaryJson: '{}',
        createdAt: new Date(),
      }));

      (prisma.journeyHistory.create as jest.Mock).mockResolvedValue(mockEntry);
      (prisma.journeyHistory.findMany as jest.Mock).mockResolvedValue([...entries]);
      (prisma.journeyHistory.deleteMany as jest.Mock).mockResolvedValue({ count: 10 });

      await service.create('user-1', 'Home', 'Office', '{}');
      expect(prisma.journeyHistory.deleteMany).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return history for a user ordered by createdAt desc', async () => {
      (prisma.journeyHistory.findMany as jest.Mock).mockResolvedValue([mockEntry]);

      const result = await service.list('user-1');
      expect(result).toHaveLength(1);
      expect(prisma.journeyHistory.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });
  });

  describe('get', () => {
    it('should return entry if owner', async () => {
      (prisma.journeyHistory.findUnique as jest.Mock).mockResolvedValue(mockEntry);

      const result = await service.get('user-1', 'hist-1');
      expect(result.id).toBe('hist-1');
    });

    it('should throw NotFoundException if entry does not exist', async () => {
      (prisma.journeyHistory.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.get('user-1', 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      (prisma.journeyHistory.findUnique as jest.Mock)
        .mockResolvedValue({ ...mockEntry, userId: 'other-user' });

      await expect(service.get('user-1', 'hist-1'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete owned entry', async () => {
      (prisma.journeyHistory.findUnique as jest.Mock).mockResolvedValue(mockEntry);
      (prisma.journeyHistory.delete as jest.Mock).mockResolvedValue(mockEntry);

      const result = await service.remove('user-1', 'hist-1');
      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException if not owner', async () => {
      (prisma.journeyHistory.findUnique as jest.Mock)
        .mockResolvedValue({ ...mockEntry, userId: 'other-user' });

      await expect(service.remove('user-1', 'hist-1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if entry not found', async () => {
      (prisma.journeyHistory.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('user-1', 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('clear', () => {
    it('should delete all entries for user', async () => {
      (prisma.journeyHistory.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await service.clear('user-1');
      expect(result.success).toBe(true);
      expect(prisma.journeyHistory.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });
});
