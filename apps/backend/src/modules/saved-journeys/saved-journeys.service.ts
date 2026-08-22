import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateSavedJourneyDto, UpdateSavedJourneyDto } from './dto/saved-journey.dto';

@Injectable()
export class SavedJourneysService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(userId: string) {
    return this.prisma.savedJourney.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateSavedJourneyDto) {
    return this.prisma.savedJourney.create({
      data: {
        userId,
        originName: dto.originName,
        destName: dto.destName,
        payloadJson: dto.payloadJson,
      },
    });
  }

  async get(userId: string, journeyId: string) {
    const journey = await this.prisma.savedJourney.findUnique({ where: { id: journeyId } });
    if (!journey) throw new NotFoundException('Saved journey not found');
    if (journey.userId !== userId) throw new ForbiddenException('Not your saved journey');
    return journey;
  }

  async update(userId: string, journeyId: string, dto: UpdateSavedJourneyDto) {
    const journey = await this.prisma.savedJourney.findUnique({ where: { id: journeyId } });
    if (!journey) throw new NotFoundException('Saved journey not found');
    if (journey.userId !== userId) throw new ForbiddenException('Not your saved journey');

    return this.prisma.savedJourney.update({
      where: { id: journeyId },
      data: {
        ...(dto.originName !== undefined && { originName: dto.originName }),
        ...(dto.destName !== undefined && { destName: dto.destName }),
        ...(dto.payloadJson !== undefined && { payloadJson: dto.payloadJson }),
      },
    });
  }

  async remove(userId: string, journeyId: string) {
    const journey = await this.prisma.savedJourney.findUnique({ where: { id: journeyId } });
    if (!journey) throw new NotFoundException('Saved journey not found');
    if (journey.userId !== userId) throw new ForbiddenException('Not your saved journey');

    await this.prisma.savedJourney.delete({ where: { id: journeyId } });
    return { success: true };
  }
}
