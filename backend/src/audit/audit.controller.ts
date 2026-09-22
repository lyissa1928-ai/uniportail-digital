import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { AuditService } from './audit.service.js';

@Controller('audit')
@Permissions('AUDIT_CONSULTER')
export class AuditController {
  constructor(
    private readonly service:
      AuditService,
  ) {}

  @Get()
  findAll(
    @Query('utilisateurId')
    utilisateurId?: string,

    @Query('ressource')
    ressource?: string,

    @Query('succes')
    succes?: string,

    @Query('dateDebut')
    dateDebut?: string,

    @Query('dateFin')
    dateFin?: string,

    @Query('limite')
    limite?: string,
  ) {
    return this.service
      .findAll(
        utilisateurId,
        ressource,
        succes,
        dateDebut,
        dateFin,
        limite,
      );
  }

  @Get('statistiques')
  statistiques(
    @Query('jours')
    jours?: string,
  ) {
    const valeur =
      Number(jours ?? 30);

    return this.service
      .statistiques(
        Number.isInteger(valeur)
          ? valeur
          : 30,
      );
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .findOne(id);
  }
}
