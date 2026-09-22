import { Module } from '@nestjs/common';

import { ConsultationController } from './consultation.controller.js';
import { ConsultationService } from './consultation.service.js';

@Module({
  controllers: [
    ConsultationController,
  ],

  providers: [
    ConsultationService,
  ],
})
export class ConsultationModule {}
