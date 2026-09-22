import { Permissions } from '../auth/decorators/permissions.decorator.js';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import { PedagogieService } from './pedagogie.service.js';
import { RejeterSeanceDto } from './dto/rejeter-seance.dto.js';

@Permissions('SEANCES_VALIDER')
@Controller('pedagogie')
export class PedagogieController {
  constructor(
    private readonly pedagogieService:
      PedagogieService,
  ) {}

  @Get('seances/en-attente')
  seancesEnAttente() {
    return this.pedagogieService
      .seancesEnAttente();
  }

  @Patch('seances/:id/valider')
  valider(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .validerSeance(id);
  }

  @Patch('seances/:id/rejeter')
  rejeter(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: RejeterSeanceDto,
  ) {
    return this.pedagogieService
      .rejeterSeance(
        id,
        dto.motif,
      );
  }

  @Patch(
    'seances/:id/remettre-en-attente',
  )
  remettreEnAttente(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .remettreEnAttente(id);
  }

  @Get(
    'affectations/:id/progression',
  )
  progressionAffectation(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .progressionAffectation(id);
  }

  @Get('classes/:id/suivi')
  suiviClasse(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .suiviClasse(id);
  }

  @Get('formations/:id/suivi')
  suiviFormation(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .suiviFormation(id);
  }
}
