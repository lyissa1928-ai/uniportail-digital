import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import {
  Permissions,
} from '../../auth/decorators/permissions.decorator.js';

import {
  SoutenancesService,
} from './soutenances.service.js';

import {
  CreateSoutenanceDto,
} from './dto/create-soutenance.dto.js';

import {
  UpdateSoutenanceDto,
} from './dto/update-soutenance.dto.js';

type AuthenticatedRequest =
  Request & {
    user?: {
      id?: number;
      sub?: number;
      email?: string;
      nomAffichage?: string;
    };
  };

@Controller('soutenances')
export class SoutenancesController {
  constructor(
    private readonly service:
      SoutenancesService,
  ) {}

  @Post()
  @Permissions(
    'ELIGIBILITE_GERER',
  )
  create(
    @Body()
    dto:
      CreateSoutenanceDto,
  ) {
    return this.service
      .create(
        dto,
      );
  }

  @Get()
  @Permissions(
    'ELIGIBILITE_CONSULTER',
  )
  findAll() {
    return this.service
      .findAll();
  }

  @Get('candidats')
  @Permissions(
    'ELIGIBILITE_CONSULTER',
  )
  candidats(
    @Query('annee')
    annee?: string,
  ) {
    return this.service
      .candidats(
        annee,
      );
  }

  @Get('planning')
  @Permissions(
    'ELIGIBILITE_CONSULTER',
  )
  planning(
    @Query('annee')
    annee?: string,
  ) {
    return this.service
      .planning(
        annee,
      );
  }

  @Get('terminees')
  @Permissions(
    'ELIGIBILITE_CONSULTER',
  )
  terminees(
    @Query('annee')
    annee?: string,
  ) {
    return this.service
      .terminees(
        annee,
      );
  }

  @Get('rapport')
  @Permissions(
    'REPORTING_CONSULTER',
  )
  rapport(
    @Query('annee')
    annee?: string,
  ) {
    return this.service
      .rapport(
        annee,
      );
  }

  @Get(':id')
  @Permissions(
    'ELIGIBILITE_CONSULTER',
  )
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .findOne(
        id,
      );
  }

  @Patch(':id')
  @Permissions(
    'ELIGIBILITE_GERER',
  )
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto:
      UpdateSoutenanceDto,
  ) {
    return this.service
      .update(
        id,
        dto,
      );
  }

  @Patch(':id/valider')
  @Permissions(
    'ELIGIBILITE_GERER',
  )
  valider(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request:
      AuthenticatedRequest,
  ) {
    const actor =
      request.user
        ?.email ??
      request.user
        ?.nomAffichage ??
      String(
        request.user?.sub ??
        request.user?.id ??
        'utilisateur-authentifie',
      );

    return this.service
      .valider(
        id,
        actor,
      );
  }

  @Patch(':id/invalider')
  @Permissions(
    'ELIGIBILITE_GERER',
  )
  invalider(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .invalider(
        id,
      );
  }
}