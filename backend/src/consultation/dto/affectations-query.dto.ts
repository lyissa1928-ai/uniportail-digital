import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

import { PaginationQueryDto } from './pagination-query.dto.js';

export class AffectationsQueryDto
  extends PaginationQueryDto
{
  @IsString()
  @IsOptional()
  annee?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  enseignantId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  coursId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  classeId?: number;

  @IsIn([
    'true',
    'false',
  ])
  @IsOptional()
  actif?: string;

  @IsIn([
    'createdAt',
    'anneeAcademique',
  ])
  @IsOptional()
  sortBy:
    string = 'createdAt';
}
