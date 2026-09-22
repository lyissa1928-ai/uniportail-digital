import { Module } from '@nestjs/common';
import { FilieresController } from './filieres.controller.js';
import { FilieresService } from './filieres.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [FilieresController],
  providers: [FilieresService],
})
export class FilieresModule {}