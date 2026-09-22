import {
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaginationQueryDto } from './pagination-query.dto.js';

export class EnseignantsQueryDto
  extends PaginationQueryDto
{
  @IsIn([
    'true',
    'false',
  ])
  @IsOptional()
  actif?: string;

  @IsString()
  @IsOptional()
  statut?: string;

  @IsIn([
    'nom',
    'prenom',
    'matricule',
    'email',
    'specialite',
    'createdAt',
  ])
  @IsOptional()
  sortBy:
    string = 'createdAt';
}
