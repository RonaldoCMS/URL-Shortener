import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
  .setTitle('URL Shortener')
  .setDescription('API per accorciare URL con Redis e PostgreSQL')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
