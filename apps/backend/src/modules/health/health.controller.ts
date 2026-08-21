import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async check() {
    const status = {
      api: 'ok',
      database: 'unknown',
      timestamp: new Date().toISOString(),
      env: this.config.get<string>('NODE_ENV') ?? 'development',
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      status.database = 'ok';
    } catch (err) {
      status.database = 'down';
    }

    return status;
  }
}
