import {
  Module,
} from '@nestjs/common';

import {
  ConfigModule,
} from '@nestjs/config';

import {
  PrismaModule,
} from '../../prisma/prisma.module.js';

import {
  ImportEtudiantsController,
} from './import-etudiants.controller.js';

import {
  ImportEtudiantsService,
} from './import-etudiants.service.js';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],

  controllers: [
    ImportEtudiantsController,
  ],

  providers: [
    ImportEtudiantsService,
  ],
})
export class ImportEtudiantsModule {}