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

import { ClassesService } from './classes.service.js';
import { CreateClasseDto } from './dto/create-classe.dto.js';
import { UpdateClasseDto } from './dto/update-classe.dto.js';

@Permissions('REFERENTIEL_CONSULTER')
@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
  ) {}

  @Permissions('REFERENTIEL_GERER')
  @Post()
  create(@Body() dto: CreateClasseDto) {
    return this.classesService.create(dto);
  }

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get('niveau/:niveauId')
  findByNiveau(
    @Param('niveauId', ParseIntPipe)
    niveauId: number,
  ) {
    return this.classesService.findByNiveau(
      niveauId,
    );
  }

  @Get('annee/:annee')
  findByAnnee(
    @Param('annee') annee: string,
  ) {
    return this.classesService.findByAnnee(
      annee,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.classesService.findOne(id);
  }

  @Permissions('REFERENTIEL_GERER')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClasseDto,
  ) {
    return this.classesService.update(id, dto);
  }

  @Permissions('REFERENTIEL_GERER')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.classesService.remove(id);
  }
}
