import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SavedPlacesService } from './saved-places.service';
import { CreateSavedPlaceDto, UpdateSavedPlaceDto } from './dto/saved-place.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';

@Controller('saved-places')
@UseGuards(JwtAuthGuard)
export class SavedPlacesController {
  constructor(private readonly service: SavedPlacesService) {}

  @Get()
  list(@Request() req: any) {
    return this.service.list(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateSavedPlaceDto) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateSavedPlaceDto) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }
}