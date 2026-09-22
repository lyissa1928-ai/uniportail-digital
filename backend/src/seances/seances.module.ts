import { Module } from '@nestjs/common';

import { SeancesController } from './seances.controller.js';
import { SeancesService } from './seances.service.js';

@Module({
  controllers: [
    SeancesController,
  ],

  providers: [
    SeancesService,
  ],
})
export class SeancesModule {}
