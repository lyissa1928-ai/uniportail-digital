import { Module } from '@nestjs/common';

import { PedagogieController } from './pedagogie.controller.js';
import { PedagogieService } from './pedagogie.service.js';

@Module({
  controllers: [
    PedagogieController,
  ],

  providers: [
    PedagogieService,
  ],
})
export class PedagogieModule {}
