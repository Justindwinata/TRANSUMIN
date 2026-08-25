import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { PrismaClient } from '@prisma/client';

describe('HistoryService', () => {
  let service: HistoryService;
  let prisma: PrismaClient;

  const mockEntries = [
    {
      id: 'h1',
      userId: 'user-1',
      originName: 'Jakarta',
      destName: 'Bandung',
      summaryJson: '{}',
      createdAt: new Date('2024-01-01T10:00:00Z'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: PrismaClient,
          useValue: {
            journeyHistory: {
              create: jest.fn().mockImplementation((data) =>
                Promise.resolve({ id: 'new-id', ...data.data })),
              findMany: jest.fn().mockResolvedValue([]),
              findFirst: jest.fn().mockResolvedValue(null),
              update: jest.fn().mockResolvedValue({}),
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
              delete: jest.fn().mockResolvedValue({}),
              findUnique: jest.fn().mockResolvedValue(null),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create new entry when no duplicate exists', async () => {
    jest.spyOn(service as any, 'sync' as any).mockRejectedValue(null);

    await service.create('user-1', 'A', 'B', '{}');
    expect(prisma.journeyHistory.create).toHaveBeenCalled();
  });

  it('should update existing entry when duplicate found (dedupe by originName + destName)', async () => {
    mockEntries[0] = {
      id: 'existing-1',
      userId: 'user-1',
      originName: 'Jakarta',
      destName: 'Bandung',
      summaryJson: '{}',
      createdAt: new Date('2024-01-01T10:00:00Z'),
    };

    prisma.journeyHistory.findFirst = jest.fn().mockResolvedValue(mockEntries[0]);

    await service.sync('user-1', [{
      originName: 'Jakarta',
      destName: 'Bandung',
      summaryJson: '{"updated": true}',
      searchedAt: '2024-01-02T12:00:00Z',
    }]);

    expect(prisma.journeyHistory.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        originName: 'Jakarta',
        destName: 'Bandung',
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(prisma.journeyHistory.update).toHaveBeenCalledWith({
      where: { id: 'existing-1' },
      data: {
        summaryJson: '{"updated": true}',
        createdAt: new Date('2024-01-02T12:00:00Z'),
      },
    });
    expect(prisma.journeyHistory.create).not.toHaveBeenCalled();
  });

  it('should create new entry when no duplicate found', async () => {
    prisma.journeyHistory.findFirst = jest.fn().mockResolvedValue(null);
    prisma.journeyHistory.create = jest.fn().mockImplementation((data) =>
      Promise.resolve({ id: 'new-id', createdAt: new Date(), ...data.data }));

    await service.sync('user-1', [{
      originName: 'New',
      destName: 'Route',
      summaryJson: '{}',
      searchedAt: '2024-01-02T12:00:00Z',
    }]);

    expect(prisma.journeyHistory.findFirst).toHaveBeenCalled();
    expect(prisma.journeyHistory.update).not.toHaveBeenCalled();
    expect(prisma.journeyHistory.create).toHaveBeenCalled();
  });

  it('should enforce 50-entry cap after sync', async () => {
    prisma.journeyHistory.findFirst = jest.fn().mockResolvedValue(null);
    prisma.journeyHistory.create = jest.fn().mockResolvedValue({});

    const allEntries = Array.from({ length: 52 }, (_, i) => ({
      id: `entry-${i}`,
      userId: 'user-1',
      createdAt: new Date(Date.now() - i * 1000),
    }));

    prisma.journeyHistory.findMany = jest.fn().mockResolvedValue(allEntries);

    await service.sync('user-1', [{
      originName: 'A',
      destName: 'B',
      summaryJson: '{}',
      searchedAt: '2024-01-02T12:00:00Z',
    }]);

    expect(prisma.journeyHistory.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: expect.arrayContaining(['entry-50', 'entry-51']) } },
    });
  });
});
