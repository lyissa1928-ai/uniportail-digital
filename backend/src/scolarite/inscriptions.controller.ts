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
import { CreateInscriptionDto } from './dto/create-inscription.dto.js';
import { UpdateInscriptionDto } from './dto/update-inscription.dto.js';

@Permissions('SCOLARITE_GERER')
@Controller('inscriptions')
export class InscriptionsController {
  constructor(
    private readonly service:
      ScolariteService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateInscriptionDto,
  ) {
    return this.service
      .createInscription(dto);
  }

  @Get()
  findAll() {
    return this.service
      .findAllInscriptions();
  }

  @Get('etudiant/:id')
  byEtudiant(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .inscriptionsEtudiant(id);
  }

  @Get('classe/:id')
  byClasse(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .inscriptionsClasse(id);
  }

  @Get('annee/:annee')
  byAnnee(
    @Param('annee')
    annee: string,
  ) {
    return this.service
      .inscriptionsAnnee(annee);
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
      .findInscription(id);
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateInscriptionDto,
  ) {
    return this.service
      .updateInscription(
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
      .removeInscription(id);
  }
}
