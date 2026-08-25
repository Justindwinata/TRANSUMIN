import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaClient } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaClient;

  const mockNotifications = [
    {
      id: 'notif-1',
      userId: 'user-1',
      title: 'Test Notification',
      body: 'Test body',
      type: 'info',
      severity: 'low',
      isRead: false,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'notif-2',
      userId: 'user-1',
      title: 'Read Notification',
      body: 'Read body',
      type: 'info',
      severity: 'low',
      isRead: true,
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 'notif-3',
      userId: 'user-2',
      title: 'Other User',
      body: 'Other body',
      type: 'info',
      severity: 'high',
      isRead: false,
      createdAt: new Date('2024-01-03'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaClient,
          useValue: {
            notification: {
              findMany: jest.fn().mockImplementation(({ where, take }) => {
                const filtered = mockNotifications.filter((n) => n.userId === where.userId);
                return Promise.resolve(take ? filtered.slice(0, take) : filtered);
              }),
              count: jest.fn().mockImplementation(({ where }) => {
                return Promise.resolve(
                  mockNotifications.filter(
                    (n) => n.userId === where.userId && n.isRead === where.isRead,
                  ).length,
                );
              }),
              findUnique: jest.fn().mockImplementation(({ where }) => {
                return Promise.resolve(
                  mockNotifications.find((n) => n.id === where.id) ?? null,
                );
              }),
              update: jest.fn().mockImplementation(({ where, data }) => {
                const existing = mockNotifications.find((n) => n.id === where.id);
                return Promise.resolve({ ...existing, ...data });
              }),
              updateMany: jest.fn().mockResolvedValue({ count: 1 }),
              create: jest.fn().mockImplementation((data) =>
                Promise.resolve({
                  id: 'new-id',
                  isRead: false,
                  ...data,
                }),
              ),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return notifications scoped to the requesting user', async () => {
    const result = await service.getNotifications('user-1', 50);
    expect(result).toHaveLength(2);
    expect(result.every((n) => n.userId === 'user-1')).toBe(true);
  });

  it('should return zero notifications for different user', async () => {
    const result = await service.getNotifications('user-999', 50);
    expect(result).toHaveLength(0);
  });

  it('should count unread notifications per user', async () => {
    const count = await service.getUnreadCount('user-1');
    expect(count).toBe(1);
  });

  it('should mark notification as read only for owner', async () => {
    const result = await service.markAsRead('user-1', 'notif-1');
    expect(result).toBeDefined();
    expect(result?.isRead).toBe(true);

    expect(prisma.notification.update).toHaveBeenCalled();
  });

  it('should return null when marking another user notification as read', async () => {
    const result = await service.markAsRead('user-1', 'notif-3');
    expect(result).toBeNull();
  });

  it('should return null for nonexistent notification', async () => {
    const result = await service.markAsRead('user-1', 'nonexistent');
    expect(result).toBeNull();
  });

  it('should mark all unread notifications as read for user', async () => {
    const result = await service.markAllAsRead('user-1');
    expect(result.count).toBe(1);
  });
});
