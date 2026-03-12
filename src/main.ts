import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
  );

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // rimuove campi non dichiarati nel DTO
    forbidNonWhitelisted: true, // lancia errore se arrivano campi extra
    transform: true,        // trasforma automaticamente i tipi (es. string → number)
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
