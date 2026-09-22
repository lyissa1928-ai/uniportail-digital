import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateBrandingDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  appName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  appSubtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  heroTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(900)
  heroDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  quoteText?: string;
}
