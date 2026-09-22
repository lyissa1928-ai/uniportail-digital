import {
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaginationQueryDto } from './pagination-query.dto.js';

export class DiplomesQueryDto
  extends PaginationQueryDto
{
  @IsString()
  @IsOptional()
  statut?: string;

  @IsString()
  @IsOptional()
  annee?: string;

  @IsIn([
    'dateDemande',
    'createdAt',
    'statut',
  ])
  @IsOptional()
  sortBy:
    string = 'dateDemande';
}
