import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { Permissions } from '../auth/decorators/permissions.decorator.js';

import { ConsultationService } from './consultation.service.js';

import { EtudiantsQueryDto } from './dto/etudiants-query.dto.js';
import { EnseignantsQueryDto } from './dto/enseignants-query.dto.js';
import { AffectationsQueryDto } from './dto/affectations-query.dto.js';
import { DiplomesQueryDto } from './dto/diplomes-query.dto.js';

@Controller('consultation')
export class ConsultationController {
  constructor(
    private readonly service:
      ConsultationService,
  ) {}

  @Permissions('SCOLARITE_GERER')
  @Get('etudiants')
  etudiants(
    @Query()
    query:
      EtudiantsQueryDto,
  ) {
    return this.service
      .etudiants(query);
  }

  @Permissions(
    'ENSEIGNEMENTS_CONSULTER',
  )
  @Get('enseignants')
  enseignants(
    @Query()
    query:
      EnseignantsQueryDto,
  ) {
    return this.service
      .enseignants(query);
  }

  @Permissions(
    'ENSEIGNEMENTS_CONSULTER',
  )
  @Get('affectations')
  affectations(
    @Query()
    query:
      AffectationsQueryDto,
  ) {
    return this.service
      .affectations(query);
  }

  @Permissions(
    'DIPLOMES_GERER',
  )
  @Get('diplomes')
  diplomes(
    @Query()
    query:
      DiplomesQueryDto,
  ) {
    return this.service
      .diplomes(query);
  }
}
