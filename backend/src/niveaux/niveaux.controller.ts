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

import { NiveauxService } from './niveaux.service.js';
import { CreateNiveauDto } from './dto/create-niveau.dto.js';
import { UpdateNiveauDto } from './dto/update-niveau.dto.js';

@Permissions('REFERENTIEL_CONSULTER')
@Controller('niveaux')
export class NiveauxController {
  constructor(
    private readonly niveauxService: NiveauxService,
  ) {}

  @Permissions('REFERENTIEL_GERER')
  @Post()
  create(@Body() dto: CreateNiveauDto) {
    return this.niveauxService.create(dto);
  }

  @Get()
  findAll() {
    return this.niveauxService.findAll();
  }

  @Get('terminaux')
  findTerminaux() {
    return this.niveauxService.findTerminaux();
  }

  @Get('formation/:formationId')
  findByFormation(
    @Param('formationId', ParseIntPipe)
    formationId: number,
  ) {
    return this.niveauxService.findByFormation(
      formationId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.niveauxService.findOne(id);
  }

  @Permissions('REFERENTIEL_GERER')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNiveauDto,
  ) {
    return this.niveauxService.update(id, dto);
  }

  @Permissions('REFERENTIEL_GERER')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.niveauxService.remove(id);
  }
}