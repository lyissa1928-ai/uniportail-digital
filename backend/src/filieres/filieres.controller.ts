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
import { FilieresService } from './filieres.service.js';
import { CreateFiliereDto } from './dto/create-filiere.dto.js';
import { UpdateFiliereDto } from './dto/update-filiere.dto.js';

@Permissions('REFERENTIEL_CONSULTER')
@Controller('filieres')
export class FilieresController {
  constructor(
    private readonly filieresService: FilieresService,
  ) {}

  @Permissions('REFERENTIEL_GERER')
  @Post()
  create(@Body() dto: CreateFiliereDto) {
    return this.filieresService.create(dto);
  }

  @Get()
  findAll() {
    return this.filieresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filieresService.findOne(id);
  }

  @Permissions('REFERENTIEL_GERER')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFiliereDto,
  ) {
    return this.filieresService.update(id, dto);
  }

  @Permissions('REFERENTIEL_GERER')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.filieresService.remove(id);
  }
}