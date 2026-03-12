import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { UrlProcessor } from './url.processor';
import { Url } from './url.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Url]),
    BullModule.registerQueue({
      name: 'url-expiration',
    }),
  ],
  controllers: [UrlController],
  providers: [UrlService, UrlProcessor],
})
export class UrlModule {}