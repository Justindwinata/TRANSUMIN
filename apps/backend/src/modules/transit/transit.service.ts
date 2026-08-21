import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TransitService {
  constructor(private readonly prisma: PrismaClient) {}
  
  async getRoutes() {
    return this.prisma.route.findMany();
  }
}
