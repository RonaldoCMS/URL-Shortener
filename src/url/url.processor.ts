import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Url } from './url.entity';

@Processor('url-expiration')
export class UrlProcessor extends WorkerHost {
  private readonly logger = new Logger(UrlProcessor.name);

  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { shortCode } = job.data;
    this.logger.log(`🗑️ Eliminazione URL scaduto: ${shortCode}`);

    await this.cacheManager.del(shortCode);

    const url = await this.urlRepository.findOne({ where: { shortCode } });
    if (url) {
      await this.urlRepository.remove(url);
      this.logger.log(`✅ URL eliminato: ${shortCode}`);
    }
  }
}