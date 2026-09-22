import {
  IsIn,
  IsOptional,
} from 'class-validator';

import { PaginationQueryDto } from './pagination-query.dto.js';

export class EtudiantsQueryDto
  extends PaginationQueryDto
{
  @IsIn([
    'true',
    'false',
  ])
  @IsOptional()
  actif?: string;

  @IsIn([
    'nom',
    'prenom',
    'matricule',
    'email',
    'createdAt',
  ])
  @IsOptional()
  sortBy:
    string = 'createdAt';
}
