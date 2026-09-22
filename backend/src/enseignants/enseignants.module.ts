import { Module } from '@nestjs/common';

import { EnseignantsController } from './enseignants.controller.js';
import { EnseignantsService } from './enseignants.service.js';

@Module({
  controllers: [EnseignantsController],
  providers: [EnseignantsService],
})
export class EnseignantsModule {}
