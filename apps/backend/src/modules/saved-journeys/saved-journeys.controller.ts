import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SavedJourneysService } from './saved-journeys.service';
import { CreateSavedJourneyDto, UpdateSavedJourneyDto } from './dto/saved-journey.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';

@Controller('saved-journeys')
@UseGuards(JwtAuthGuard)
export class SavedJourneysController {
  constructor(private readonly service: SavedJourneysService) {}

  @Get()
  list(@Request() req: any) {
    return this.service.list(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateSavedJourneyDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get(':id')
  get(@Request() req: any, @Param('id') id: string) {
    return this.service.get(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateSavedJourneyDto) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }
}