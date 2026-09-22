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

import { ScolariteService } from './scolarite.service.js';
import { CreateEtudiantDto } from './dto/create-etudiant.dto.js';
import { UpdateEtudiantDto } from './dto/update-etudiant.dto.js';

@Permissions('SCOLARITE_GERER')
@Controller('etudiants')
export class EtudiantsController {
  constructor(
    private readonly service:
      ScolariteService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateEtudiantDto,
  ) {
    return this.service
      .createEtudiant(dto);
  }

  @Get()
  findAll() {
    return this.service
      .findAllEtudiants();
  }

  @Get('matricule/:matricule')
  findByMatricule(
    @Param('matricule')
    matricule: string,
  ) {
    return this.service
      .findEtudiantByMatricule(
        matricule,
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
      .findEtudiant(id);
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateEtudiantDto,
  ) {
    return this.service
      .updateEtudiant(
        id,
        dto,
      );
  }

  @Delete(':id')
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .removeEtudiant(id);
  }
}
