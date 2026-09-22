import { Module } from '@nestjs/common';

import { EligibiliteController } from './eligibilite.controller.js';
import { EligibiliteService } from './eligibilite.service.js';

@Module({
  controllers: [
    EligibiliteController,
  ],

  providers: [
    EligibiliteService,
  ],

  exports: [
    EligibiliteService,
  ],
})
export class EligibiliteModule {}
