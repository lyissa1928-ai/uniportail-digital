import { Permissions } from '../auth/decorators/permissions.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { SeancesService } from './seances.service.js';
import { CreateSeanceDto } from './dto/create-seance.dto.js';
import { UpdateSeanceDto } from './dto/update-seance.dto.js';

@Permissions('ENSEIGNEMENTS_CONSULTER')
@Controller('seances')
export class SeancesController {
  constructor(
    private readonly seancesService:
      SeancesService,
  ) {}

  @Permissions('SEANCES_DECLARER')
  @Post()
  create(
    @Body() dto: CreateSeanceDto,
  ) {
    return this.seancesService.create(dto);
  }

  @Get()
  findAll() {
    return this.seancesService.findAll();
  }

  @Get('affectation/:affectationId/progression')
  progression(
    @Param(
      'affectationId',
      ParseIntPipe,
    )
    affectationId: number,
  ) {
    return this.seancesService.progression(
      affectationId,
    );
  }

  @Get('affectation/:affectationId')
  findByAffectation(
    @Param(
      'affectationId',
      ParseIntPipe,
    )
    affectationId: number,
  ) {
    return this.seancesService.findByAffectation(
      affectationId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.findOne(id);
  }

  @Permissions('SEANCES_DECLARER')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateSeanceDto,
  ) {
    return this.seancesService.update(
      id,
      dto,
    );
  }

  @Permissions('SEANCES_VALIDER')
  @Patch(':id/valider')
  valider(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.valider(id);
  }

  @Permissions('SEANCES_VALIDER')
  @Patch(':id/rejeter')
  rejeter(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.rejeter(id);
  }

  @Permissions('SEANCES_DECLARER')
  @Patch(':id/annuler')
  annuler(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.annuler(id);
  }

  @Permissions('SEANCES_DECLARER')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.remove(id);
  }
}
