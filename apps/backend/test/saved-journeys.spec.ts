import { Test, TestingModule } from '@nestjs/testing';
import { SavedJourneysService } from '../src/modules/saved-journeys/saved-journeys.service';
import { PrismaClient, SavedJourney } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('SavedJourneysService', () => {
  let service: SavedJourneysService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = {
      savedJourney: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    } as any;

    service = new SavedJourneysService(prisma);
  });

  const mockJourney: SavedJourney = {
    id: 'sj-1',
    userId: 'user-1',
    originName: 'Home',
    destName: 'Office',
    payloadJson: '{"originLat":-6.2,"originLon":106.8,"destLat":-6.3,"destLon":106.9}',
    createdAt: new Date(),
  };

  describe('create', () => {
    it('should create a saved journey', async () => {
      (prisma.savedJourney.create as jest.Mock).mockResolvedValue(mockJourney);

      const result = await service.create('user-1', {
        originName: 'Home',
        destName: 'Office',
        payloadJson: '{"originLat":-6.2}',
        label: 'Work Route',
      });
      expect(result.id).toBe('sj-1');
    });
  });

  describe('list', () => {
    it('should return all journeys for a user', async () => {
      (prisma.savedJourney.findMany as jest.Mock).mockResolvedValue([mockJourney]);

      const result = await service.list('user-1');
      expect(result).toHaveLength(1);
      expect(prisma.savedJourney.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('get', () => {
    it('should return journey if owner', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(mockJourney);

      const result = await service.get('user-1', 'sj-1');
      expect(result.id).toBe('sj-1');
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.get('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      (prisma.savedJourney.findUnique as jest.Mock)
        .mockResolvedValue({ ...mockJourney, userId: 'other-user' });
      await expect(service.get('user-1', 'sj-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete owned journey', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(mockJourney);
      (prisma.savedJourney.delete as jest.Mock).mockResolvedValue(mockJourney);

      const result = await service.remove('user-1', 'sj-1');
      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException if not owner', async () => {
      (prisma.savedJourney.findUnique as jest.Mock)
        .mockResolvedValue({ ...mockJourney, userId: 'other-user' });
      await expect(service.remove('user-1', 'sj-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
