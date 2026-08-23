import { Test, TestingModule } from '@nestjs/testing';
import { SavedJourneysService } from '../src/modules/saved-journeys/saved-journeys.service';
import { SavedJourneysController } from '../src/modules/saved-journeys/saved-journeys.controller';
import { PrismaClient, SavedJourney } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateSavedJourneyDto, UpdateSavedJourneyDto } from '../src/modules/saved-journeys/dto/saved-journey.dto';

describe('SavedJourneysService ownership isolation', () => {
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

  const mockJourney = (overrides: Partial<SavedJourney> = {}): SavedJourney => ({
    id: 'sj-1',
    userId: 'user-1',
    originName: 'Home',
    destName: 'Office',
    payloadJson: '{"originLat":-6.2,"originLon":106.8,"destLat":-6.3,"destLon":106.9}',
    createdAt: new Date(),
    ...overrides,
  });

  describe('list', () => {
    it('should return journeys for the authenticated user only', async () => {
      (prisma.savedJourney.findMany as jest.Mock).mockImplementation((args) => {
        if (args.where.userId === 'user-1') return [mockJourney({ id: 'j1', userId: 'user-1' })];
        if (args.where.userId === 'user-2') return [mockJourney({ id: 'j2', userId: 'user-2' })];
        return [];
      });

      const result1 = await service.list('user-1');
      const result2 = await service.list('user-2');

      expect(result1).toHaveLength(1);
      expect(result1[0].userId).toBe('user-1');
      expect(result2).toHaveLength(1);
      expect(result2[0].userId).toBe('user-2');
    });
  });

  describe('create', () => {
    it('should create a saved journey', async () => {
      (prisma.savedJourney.create as jest.Mock).mockResolvedValue(mockJourney());

      const dto: CreateSavedJourneyDto = {
        originName: 'Home',
        destName: 'Office',
        payloadJson: '{"originLat":-6.2}',
        label: 'Work Route',
      };
      const result = await service.create('user-1', dto);
      expect(result.id).toBe('sj-1');
    });
  });

  describe('get', () => {
    it('should retrieve owned journey', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(mockJourney());
      const result = await service.get('user-1', 'sj-1');
      expect(result.id).toBe('sj-1');
    });

    it('should throw NotFoundException for non-existent journey', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.get('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not owner', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(
        mockJourney({ userId: 'user-2' }),
      );
      await expect(service.get('user-1', 'sj-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update owned journey', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(mockJourney());
      (prisma.savedJourney.update as jest.Mock).mockResolvedValue({ ...mockJourney(), originName: 'Updated' });

      const dto: UpdateSavedJourneyDto = { originName: 'Updated' };
      const result = await service.update('user-1', 'sj-1', dto);
      expect(result.originName).toBe('Updated');
    });

    it('should deny update for non-owner', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(
        mockJourney({ userId: 'user-2' }),
      );
      const dto: UpdateSavedJourneyDto = { destName: 'Hacked' };
      await expect(service.update('user-1', 'sj-1', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete owned journey', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(mockJourney());
      (prisma.savedJourney.delete as jest.Mock).mockResolvedValue(mockJourney());

      const result = await service.remove('user-1', 'sj-1');
      expect(result.success).toBe(true);
    });

    it('should deny delete for non-owner', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(
        mockJourney({ userId: 'user-2' }),
      );
      await expect(service.remove('user-1', 'sj-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent journey', async () => {
      (prisma.savedJourney.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
