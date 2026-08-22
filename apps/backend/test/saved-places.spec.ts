import { Test, TestingModule } from '@nestjs/testing';
import { SavedPlacesService } from '../src/modules/saved-places/saved-places.service';
import { PrismaClient, SavedPlace } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('SavedPlacesService', () => {
  let service: SavedPlacesService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = {
      savedPlace: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    service = new SavedPlacesService(prisma);
  });

  const mockPlace: SavedPlace = {
    id: 'place-1',
    userId: 'user-1',
    name: 'Kampus',
    address: 'Jl. Sudirman',
    lat: -6.2,
    lon: 106.8,
    createdAt: new Date(),
  };

  describe('list', () => {
    it('should return all places for a user', async () => {
      (prisma.savedPlace.findMany as jest.Mock).mockResolvedValue([mockPlace]);

      const result = await service.list('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('place-1');
      expect(prisma.savedPlace.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new saved place', async () => {
      (prisma.savedPlace.create as jest.Mock).mockResolvedValue(mockPlace);

      const result = await service.create('user-1', {
        name: 'Kampus',
        address: 'Jl. Sudirman',
        lat: -6.2,
        lon: 106.8,
      });

      expect(result.id).toBe('place-1');
      expect(prisma.savedPlace.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update owned place', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue(mockPlace);
      (prisma.savedPlace.update as jest.Mock).mockResolvedValue({ ...mockPlace, name: 'Kantor' });

      const result = await service.update('user-1', 'place-1', { name: 'Kantor' });

      expect(result.name).toBe('Kantor');
    });

    it('should throw NotFoundException if place not found', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('user-1', 'nonexistent', { name: 'X' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue({ ...mockPlace, userId: 'other-user' });

      await expect(service.update('user-1', 'place-1', { name: 'X' }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete owned place', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue(mockPlace);
      (prisma.savedPlace.delete as jest.Mock).mockResolvedValue(mockPlace);

      const result = await service.remove('user-1', 'place-1');

      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException if not owner', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue({ ...mockPlace, userId: 'other-user' });

      await expect(service.remove('user-1', 'place-1'))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
