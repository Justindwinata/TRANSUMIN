import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
  private readonly MAX_HISTORY_ENTRIES = 50;

  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, originName: string, destName: string, summaryJson: string): Promise<JourneyHistoryEntry> {
    const entry = await this.prisma.journeyHistory.create({
      data: {
        userId,
        originName,
        destName,
        summaryJson,
      },
    });

    // Enforce maximum history limit
    const count = await this.prisma.journeyHistory.count({ where: { userId } });
    if (count > this.MAX_HISTORY_ENTRIES) {
      const oldest = await this.prisma.journeyHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (oldest) {
        await this.prisma.journeyHistory.delete({ where: { id: oldest.id } });
      }
    }

    return entry;
  }

  async list(userId: string, limit: number = 10): Promise<JourneyHistoryEntry[]> {
    return this.prisma.journeyHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async get(userId: string, historyId: string): Promise<JourneyHistoryEntry> {
    const entry = await this.prisma.journeyHistory.findUnique({ where: { id: historyId } });
    if (!entry) throw new NotFoundException('History entry not found');
    if (entry.userId !== userId) throw new ForbiddenException('Not your history');
    return entry;
  }

  async remove(userId: string, historyId: string): Promise<{ success: boolean }> {
    const entry = await this.prisma.journeyHistory.findUnique({ where: { id: historyId } });
    if (!entry) throw new NotFoundException('History entry not found');
    if (entry.userId !== userId) throw new ForbiddenException('Not your history');

    await this.prisma.journeyHistory.delete({ where: { id: historyId } });
    return { success: true };
  }

  async clear(userId: string): Promise<{ success: boolean }> {
    await this.prisma.journeyHistory.deleteMany({ where: { userId } });
    return { success: true };
  }
}
