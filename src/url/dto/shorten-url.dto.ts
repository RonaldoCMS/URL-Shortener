import { IsUrl, IsInt, IsOptional, Min, Max } from 'class-validator';

export class ShortenUrlDto {
  @IsUrl({}, { message: 'originalUrl deve essere un URL valido' })
  originalUrl!: string;

  @IsInt({ message: 'ttlSeconds deve essere un numero intero' })
  @IsOptional()
  @Min(60, { message: 'ttlSeconds minimo 60 secondi' })
  @Max(86400, { message: 'ttlSeconds massimo 86400 secondi (1 giorno)' })
  ttlSeconds?: number;
}