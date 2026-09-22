import { Module } from '@nestjs/common';

import { EligibiliteModule } from '../eligibilite/eligibilite.module.js';
import { DiplomesController } from './diplomes.controller.js';
import { DiplomesService } from './diplomes.service.js';

@Module({
  imports: [
    EligibiliteModule,
  ],

  controllers: [
    DiplomesController,
  ],

  providers: [
    DiplomesService,
  ],

  exports: [
    DiplomesService,
  ],
})
export class DiplomesModule {}
