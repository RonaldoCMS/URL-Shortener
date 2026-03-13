import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { UrlModule } from './url/url.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    // Carica le variabili d'ambiente dal file .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Connessione a PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => {
        var dbConfig = {
          type: 'postgres' as const,
          host: config.get('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get('DB_USER'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: config.get('TESTING') === 'true', // Sincronizza solo in ambiente di testing
        };
        console.log('DB CONFIG:', dbConfig);
        return dbConfig;
      },
    }),

    // Connessione a Redis
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.get('REDIS_HOST'),
            port: config.get<number>('REDIS_PORT'),
          },
        }),
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),

    BullModule.registerQueue({
      name: 'url-expiration',
    }),

    UrlModule,
  ],
})
export class AppModule {}
