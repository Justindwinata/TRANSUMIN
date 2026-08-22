import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SavedJourneysService } from './saved-journeys.service';
import { SavedJourneysController } from './saved-journeys.controller';

@Module({
  imports: [PrismaModule],
  providers: [SavedJourneysService],
  controllers: [SavedJourneysController],
  exports: [SavedJourneysService],
})
export class SavedJourneysModule {}