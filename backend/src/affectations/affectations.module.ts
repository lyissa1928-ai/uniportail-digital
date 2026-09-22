import { Module } from '@nestjs/common';

import { AffectationsController } from './affectations.controller.js';
import { AffectationsService } from './affectations.service.js';

@Module({
  controllers: [
    AffectationsController,
  ],

  providers: [
    AffectationsService,
  ],

  exports: [
    AffectationsService,
  ],
})
export class AffectationsModule {}
