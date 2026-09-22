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

import { EnseignantsService } from './enseignants.service.js';
import { CreateEnseignantDto } from './dto/create-enseignant.dto.js';
import { UpdateEnseignantDto } from './dto/update-enseignant.dto.js';

@Permissions('ENSEIGNEMENTS_CONSULTER')
@Controller('enseignants')
export class EnseignantsController {
  constructor(
    private readonly enseignantsService:
      EnseignantsService,
  ) {}

  @Permissions('ENSEIGNEMENTS_GERER')
  @Post()
  create(
    @Body() dto: CreateEnseignantDto,
  ) {
    return this.enseignantsService.create(dto);
  }

  @Get()
  findAll() {
    return this.enseignantsService.findAll();
  }

  @Get('matricule/:matricule')
  findByMatricule(
    @Param('matricule') matricule: string,
  ) {
    return this.enseignantsService.findByMatricule(
      matricule,
    );
  }

  @Get('recherche/:terme')
  search(
    @Param('terme') terme: string,
  ) {
    return this.enseignantsService.search(terme);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.enseignantsService.findOne(id);
  }

  @Permissions('ENSEIGNEMENTS_GERER')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEnseignantDto,
  ) {
    return this.enseignantsService.update(
      id,
      dto,
    );
  }

  @Permissions('ENSEIGNEMENTS_GERER')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.enseignantsService.remove(id);
  }
}
