import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AnciensEtudiantsController } from './anciens-etudiants.controller.js';
import { AnciensEtudiantsService } from './anciens-etudiants.service.js';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [
    AnciensEtudiantsController,
  ],
  providers: [
    AnciensEtudiantsService,
  ],
  exports: [
    AnciensEtudiantsService,
  ],
})
export class AnciensEtudiantsModule {}
