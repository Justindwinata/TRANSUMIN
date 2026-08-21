import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggingService {
  constructor(private config: ConfigService) {}

  log(message: string, context = 'App') {
    if (this.config.get('NODE_ENV') === 'production') {
      console.log(`[${new Date().toISOString()}] [${context}] ${message}`);
    } else {
      console.log(`\x1b[36m${new Date().toISOString()}\x1b[0m [\x1b[33m${context}\x1b[0m] ${message}`);
    }
  }
}
