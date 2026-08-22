import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateSavedJourneyDto } from '../saved-journeys/dto/saved-journey.dto';

export interface JourneyHistoryEntry {
  id: string;
  userId: string;
  originName: string;
  destName: string;
  summaryJson: string;
  createdAt: Date;
}

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, originName: string, destName: string, summaryJson: string) {
    return this.prisma.journeyHistory.create({
      data: {
        userId,
        originName,
        destName,
        summaryJson,
      },
    });
  }

  async list(userId: string, limit: number = 10) {
    return this.prisma.journeyHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async clear(userId: string) {
    await this.prisma.journeyHistory.deleteMany({ where: { userId } });
    return { success: true };
  }

  async remove(userId: string, historyId: string) {
    const entry = await this.prisma.journeyHistory.findUnique({ where: { id: historyId } });
    if (!entry) throw new NotFoundException('History entry not found');
    if (entry.userId !== userId) {
      throw new NotFoundException('History entry not found');
    }

    await this.prisma.journeyHistory.delete({ where: { id: historyId } });
    return { success: true };
  }
}
