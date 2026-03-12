import { Controller, Post, Get, Param, Body, Res, Delete } from '@nestjs/common';
import express from 'express';
import { UrlService } from './url.service';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

@Post('shorten')
async shorten(
  @Body('originalUrl') originalUrl: string,
  @Body('ttlSeconds') ttlSeconds?: number,
) {
  return this.urlService.shorten(originalUrl, ttlSeconds);
}

  @Get(':shortCode')
  async resolve(@Param('shortCode') shortCode: string, @Res() res: express.Response) {
    const originalUrl = await this.urlService.resolve(shortCode);
    return res.redirect(originalUrl);
  }

  @Delete(':shortCode')
async delete(@Param('shortCode') shortCode: string) {
  await this.urlService.delete(shortCode);
  return { message: `${shortCode} eliminato con successo` };
}
}