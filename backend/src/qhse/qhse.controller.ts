import { Permissions } from '../auth/decorators/permissions.decorator.js';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { QhseService } from './qhse.service.js';

@Permissions('QHSE_CONSULTER')
@Controller('qhse')
export class QhseController {
  constructor(
    private readonly qhseService:
      QhseService,
  ) {}

  @Get('tableau-de-bord')
  tableauDeBord(
    @Query('annee')
    annee?: string,
  ) {
    return this.qhseService
      .tableauDeBord(
        annee,
      );
  }

  @Get('alertes')
  alertes(
    @Query('annee')
    annee?: string,
  ) {
    return this.qhseService
      .alertes(
        annee,
      );
  }

  @Get('classes/:id')
  suiviClasse(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.qhseService
      .suiviClasse(id);
  }

  @Get('formations/:id')
  suiviFormation(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.qhseService
      .suiviFormation(id);
  }
}
