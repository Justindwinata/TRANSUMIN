import { Test, TestingModule } from '@nestjs/testing';
import { SavedPlacesService } from '../src/modules/saved-places/saved-places.service';
import { PrismaClient, SavedPlace } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateSavedPlaceDto, UpdateSavedPlaceDto } from '../src/modules/saved-places/dto/saved-place.dto';

describe('SavedPlacesService ownership isolation', () => {
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

  const mockPlace = (overrides: Partial<SavedPlace> = {}): SavedPlace => ({
    id: 'place-1',
    userId: 'user-1',
    name: 'Home',
    address: 'Jl. Test',
    lat: -6.2,
    lon: 106.8,
    createdAt: new Date(),
    ...overrides,
  });

  describe('list', () => {
    it('should return only places belonging to the requested user', async () => {
      (prisma.savedPlace.findMany as jest.Mock).mockResolvedValue([
        mockPlace({ id: 'p1', userId: 'user-1' }),
        mockPlace({ id: 'p2', userId: 'user-1' }),
      ]);

      const result = await service.list('user-1');
      expect(result).toHaveLength(2);
      expect(result.every(p => p.userId === 'user-1')).toBe(true);
    });

    it('should isolate data between users', async () => {
      (prisma.savedPlace.findMany as jest.Mock).mockImplementation((args) => {
        if (args.where.userId === 'user-1') return [mockPlace({ id: 'p1', userId: 'user-1' })];
        if (args.where.userId === 'user-2') return [mockPlace({ id: 'p2', userId: 'user-2' })];
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
    it('should create a saved place for the given user', async () => {
      (prisma.savedPlace.create as jest.Mock).mockResolvedValue(mockPlace());

      const dto: CreateSavedPlaceDto = {
        name: 'Home', address: 'Jl. Test', lat: -6.2, lon: 106.8,
      };
      const result = await service.create('user-1', dto);

      expect(result.id).toBe('place-1');
      expect(prisma.savedPlace.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: dto.name,
          address: dto.address,
          lat: dto.lat,
          lon: dto.lon,
        },
      });
    });
  });

  describe('update', () => {
    it('should allow owner to update their place', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue(mockPlace());
      (prisma.savedPlace.update as jest.Mock).mockResolvedValue({ ...mockPlace(), name: 'Updated' });

      const dto: UpdateSavedPlaceDto = { name: 'Updated' };
      const result = await service.update('user-1', 'place-1', dto);
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when place does not exist', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue(null);
      const dto: UpdateSavedPlaceDto = { name: 'X' };
      await expect(service.update('user-1', 'nonexistent', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not the owner', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue(mockPlace({ userId: 'user-2' }));
      const dto: UpdateSavedPlaceDto = { name: 'Hacked' };
      await expect(service.update('user-1', 'place-1', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should allow owner to delete their place', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue(mockPlace());
      (prisma.savedPlace.delete as jest.Mock).mockResolvedValue(mockPlace());

      const result = await service.remove('user-1', 'place-1');
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException for non-existent place', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not the owner', async () => {
      (prisma.savedPlace.findUnique as jest.Mock).mockResolvedValue(mockPlace({ userId: 'user-2' }));
      await expect(service.remove('user-1', 'place-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
