import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  @Post()
  create(@Request() req: any, @Body() dto: { originName: string; destName: string; summaryJson: string }) {
    return this.service.create(req.user.id, dto.originName, dto.destName, dto.summaryJson);
  }

  @Get()
  list(@Request() req: any, @Query('limit') limit: string = '10') {
    const limitNum = parseInt(limit, 10) || 10;
    return this.service.list(req.user.id, limitNum);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }

  @Delete()
  clear(@Request() req: any) {
    return this.service.clear(req.user.id);
  }
}
