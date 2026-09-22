import { Module } from '@nestjs/common';

import { ScolariteService } from './scolarite.service.js';
import { EtudiantsController } from './etudiants.controller.js';
import { InscriptionsController } from './inscriptions.controller.js';

@Module({
  controllers: [
    EtudiantsController,
    InscriptionsController,
  ],

  providers: [
    ScolariteService,
  ],

  exports: [
    ScolariteService,
  ],
})
export class ScolariteModule {}
