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

import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto.js';
import { RoleDto } from './dto/role.dto.js';
import { UtilisateursService } from './utilisateurs.service.js';

@Controller('utilisateurs')
@Permissions('UTILISATEURS_GERER')
export class UtilisateursController {
  constructor(
    private readonly service:
      UtilisateursService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('roles')
  roles() {
    return this.service.roles();
  }

  @Get('permissions')
  permissions() {
    return this.service.listerPermissions();
  }

  @Post()
  create(
    @Body()
    dto: CreateUtilisateurDto,
  ) {
    return this.service.create(dto);
  }

  @Post(':id/roles')
  attribuerRole(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: RoleDto,
  ) {
    return this.service
      .attribuerRole(
        id,
        dto.roleCode,
      );
  }

  @Delete(':id/roles/:roleCode')
  retirerRole(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Param('roleCode')
    roleCode: string,
  ) {
    return this.service
      .retirerRole(
        id,
        roleCode,
      );
  }

  @Patch(':id/activer')
  activer(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .setActif(id, true);
  }

  @Patch(':id/desactiver')
  desactiver(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .setActif(id, false);
  }


  @Post('securite/synchroniser')
  synchroniserSecurite() {
    return this.service
      .initialiserReferentiel();
  }
  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service.findOne(id);
  }
}
