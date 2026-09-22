import { Module } from '@nestjs/common';

import { QhseController } from './qhse.controller.js';
import { QhseService } from './qhse.service.js';

@Module({
  controllers: [
    QhseController,
  ],

  providers: [
    QhseService,
  ],
})
export class QhseModule {}
