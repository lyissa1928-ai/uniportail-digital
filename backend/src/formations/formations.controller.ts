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

import { FormationsService } from './formations.service.js';
import { CreateFormationDto } from './dto/create-formation.dto.js';
import { UpdateFormationDto } from './dto/update-formation.dto.js';

@Permissions('REFERENTIEL_CONSULTER')
@Controller('formations')
export class FormationsController {
  constructor(
    private readonly formationsService: FormationsService,
  ) {}

  @Permissions('REFERENTIEL_GERER')
  @Post()
  create(@Body() dto: CreateFormationDto) {
    return this.formationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.formationsService.findAll();
  }

  @Get('filiere/:filiereId')
  findByFiliere(
    @Param('filiereId', ParseIntPipe) filiereId: number,
  ) {
    return this.formationsService.findByFiliere(filiereId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.formationsService.findOne(id);
  }

  @Permissions('REFERENTIEL_GERER')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFormationDto,
  ) {
    return this.formationsService.update(id, dto);
  }

  @Permissions('REFERENTIEL_GERER')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.formationsService.remove(id);
  }
}