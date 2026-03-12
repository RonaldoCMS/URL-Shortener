import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Url } from './url.entity';
import { nanoid } from 'nanoid';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UrlService {
    constructor(
        @InjectRepository(Url)
        private readonly urlRepository: Repository<Url>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,

        @InjectQueue('url-expiration')
        private readonly urlQueue: Queue,
    ) { }

    async shorten(originalUrl: string, ttlSeconds?: number): Promise<Url> {
        const shortCode = nanoid(6);
        const url = this.urlRepository.create({
            shortCode,
            originalUrl,
            expiresAt: ttlSeconds
                ? new Date(Date.now() + ttlSeconds * 1000)
                : null,
        });

        const saved = await this.urlRepository.save(url);

        // Se c'è un TTL, schedula il job di eliminazione
        if (ttlSeconds) {
            await this.urlQueue.add(
                'delete-expired-url',
                { shortCode },
                { delay: ttlSeconds * 1000 },
            );
           console.log(`⏰ Job schedulato per ${shortCode} tra ${ttlSeconds} secondi`);
        }

        return saved;
    }

    async resolve(shortCode: string): Promise<string> {
        // 1. Cerca in Redis
        const cached = await this.cacheManager.get<string>(shortCode);
        if (cached) {
            console.log('✅ Cache HIT:', shortCode);
            return cached;
        }

        // 2. Se non trovato, cerca in PostgreSQL
        console.log('❌ Cache MISS:', shortCode);
        const url = await this.urlRepository.findOne({ where: { shortCode } });
        if (!url) throw new NotFoundException('URL non trovato');

        // 3. Salva in Redis con TTL di 1 ora
        await this.cacheManager.set(
            shortCode,
            url.originalUrl,
            url.expiresAt
                ? url.expiresAt.getTime() - Date.now()
                : 3600000
        );
        return url.originalUrl;
    }

    async delete(shortCode: string): Promise<void> {
        // 1. Elimina da Redis
        await this.cacheManager.del(shortCode);
        console.log('🗑️ Cache eliminata:', shortCode);

        // 2. Elimina da PostgreSQL
        const url = await this.urlRepository.findOne({ where: { shortCode } });
        if (!url) throw new NotFoundException('URL non trovato');
        await this.urlRepository.remove(url);
        console.log('🗑️ DB eliminato:', shortCode);
    }
}