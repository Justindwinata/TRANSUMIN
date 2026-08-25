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

    const entries = await this.prisma.journeyHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (entries.length > this.MAX_HISTORY_ENTRIES) {
      const idsToDelete = entries.slice(this.MAX_HISTORY_ENTRIES).map(e => e.id);
      await this.prisma.journeyHistory.deleteMany({ where: { id: { in: idsToDelete } } });
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

  async sync(
    userId: string,
    entries: Array<{
      originName: string;
      destName: string;
      summaryJson: string;
      searchedAt: string;
    }>,
  ): Promise<JourneyHistoryEntry[]> {
    const created: JourneyHistoryEntry[] = [];

    for (const entry of entries) {
      const existing = await this.prisma.journeyHistory.findFirst({
        where: {
          userId,
          originName: entry.originName,
          destName: entry.destName,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        await this.prisma.journeyHistory.update({
          where: { id: existing.id },
          data: {
            summaryJson: entry.summaryJson,
            createdAt: new Date(entry.searchedAt),
          },
        });
      } else {
        await this.prisma.journeyHistory.create({
          data: {
            userId,
            originName: entry.originName,
            destName: entry.destName,
            summaryJson: entry.summaryJson,
          },
        });
      }
    }

    const allEntries = await this.prisma.journeyHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (allEntries.length > this.MAX_HISTORY_ENTRIES) {
      const idsToDelete = allEntries.slice(this.MAX_HISTORY_ENTRIES).map(e => e.id);
      await this.prisma.journeyHistory.deleteMany({ where: { id: { in: idsToDelete } } });
    }

    return this.list(userId, this.MAX_HISTORY_ENTRIES);
  }
}
