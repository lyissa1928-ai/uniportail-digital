import { Module } from '@nestjs/common';
import { NiveauxController } from './niveaux.controller.js';
import { NiveauxService } from './niveaux.service.js';
@Module({
  controllers: [NiveauxController],
  providers: [NiveauxService],
})
export class NiveauxModule {}