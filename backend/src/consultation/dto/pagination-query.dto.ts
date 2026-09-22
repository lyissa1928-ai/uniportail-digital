import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsIn([
    'asc',
    'desc',
  ])
  @IsOptional()
  sortOrder:
    'asc' | 'desc' = 'desc';
}
