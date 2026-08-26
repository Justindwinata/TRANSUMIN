import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ThrottlerGuard } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalGuards(new ThrottlerGuard());
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`TRANSUM-IN API running on port ${port}`);
}
bootstrap();
