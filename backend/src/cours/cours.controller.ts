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

import { CoursService } from './cours.service.js';
import { CreateCoursDto } from './dto/create-cours.dto.js';
import { UpdateCoursDto } from './dto/update-cours.dto.js';

@Permissions('REFERENTIEL_CONSULTER')
@Controller('cours')
export class CoursController {
  constructor(
    private readonly coursService: CoursService,
  ) {}

  @Permissions('REFERENTIEL_GERER')
  @Post()
  create(@Body() dto: CreateCoursDto) {
    return this.coursService.create(dto);
  }

  @Get()
  findAll() {
    return this.coursService.findAll();
  }

  @Get('niveau/:niveauId')
  findByNiveau(
    @Param('niveauId', ParseIntPipe)
    niveauId: number,
  ) {
    return this.coursService.findByNiveau(
      niveauId,
    );
  }

  @Get('semestre/:semestre')
  findBySemestre(
    @Param('semestre', ParseIntPipe)
    semestre: number,
  ) {
    return this.coursService.findBySemestre(
      semestre,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.coursService.findOne(id);
  }

  @Permissions('REFERENTIEL_GERER')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoursDto,
  ) {
    return this.coursService.update(id, dto);
  }

  @Permissions('REFERENTIEL_GERER')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.coursService.remove(id);
  }
}
