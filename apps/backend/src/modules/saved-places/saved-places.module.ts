import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SavedPlacesService } from './saved-places.service';
import { SavedPlacesController } from './saved-places.controller';

@Module({
  imports: [PrismaModule],
  providers: [SavedPlacesService],
  controllers: [SavedPlacesController],
  exports: [SavedPlacesService],
})
export class SavedPlacesModule {}