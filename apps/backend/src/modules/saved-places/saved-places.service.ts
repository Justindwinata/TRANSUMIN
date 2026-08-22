import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateSavedPlaceDto, UpdateSavedPlaceDto } from './dto/saved-place.dto';

@Injectable()
export class SavedPlacesService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(userId: string) {
    return this.prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateSavedPlaceDto) {
    return this.prisma.savedPlace.create({
      data: {
        userId,
        name: dto.name,
        address: dto.address,
        lat: dto.lat,
        lon: dto.lon,
      },
    });
  }

  async update(userId: string, placeId: string, dto: UpdateSavedPlaceDto) {
    const place = await this.prisma.savedPlace.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('Saved place not found');
    if (place.userId !== userId) throw new ForbiddenException('Not your saved place');

    return this.prisma.savedPlace.update({
      where: { id: placeId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lon !== undefined && { lon: dto.lon }),
      },
    });
  }

  async remove(userId: string, placeId: string) {
    const place = await this.prisma.savedPlace.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('Saved place not found');
    if (place.userId !== userId) throw new ForbiddenException('Not your saved place');

    await this.prisma.savedPlace.delete({ where: { id: placeId } });
    return { success: true };
  }
}
