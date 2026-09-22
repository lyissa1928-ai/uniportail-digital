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

import { AffectationsService } from './affectations.service.js';
import { CreateAffectationDto } from './dto/create-affectation.dto.js';
import { UpdateAffectationDto } from './dto/update-affectation.dto.js';

@Permissions('ENSEIGNEMENTS_CONSULTER')
@Controller('affectations')
export class AffectationsController {
  constructor(
    private readonly affectationsService:
      AffectationsService,
  ) {}

  @Permissions('ENSEIGNEMENTS_GERER')
  @Post()
  create(
    @Body()
    dto: CreateAffectationDto,
  ) {
    return this.affectationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.affectationsService.findAll();
  }

  @Get('enseignant/:id')
  findByEnseignant(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.affectationsService.findByEnseignant(id);
  }

  @Get('classe/:id')
  findByClasse(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.affectationsService.findByClasse(id);
  }

  @Get('cours/:id')
  findByCours(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.affectationsService.findByCours(id);
  }

  @Get('annee/:annee')
  findByAnnee(
    @Param('annee')
    annee: string,
  ) {
    return this.affectationsService.findByAnnee(annee);
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.affectationsService.findOne(id);
  }

  @Permissions('ENSEIGNEMENTS_GERER')
  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateAffectationDto,
  ) {
    return this.affectationsService.update(
      id,
      dto,
    );
  }

  @Permissions('ENSEIGNEMENTS_GERER')
  @Delete(':id')
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.affectationsService.remove(id);
  }
}
