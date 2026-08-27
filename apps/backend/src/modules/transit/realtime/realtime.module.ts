import { Module } from '@nestjs/common';
import { RealtimeManager } from './realtime.manager';

@Module({
  providers: [RealtimeManager],
  exports: [RealtimeManager],
})
export class RealtimeModule {}