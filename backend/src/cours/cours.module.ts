import { Module } from '@nestjs/common';

import { CoursController } from './cours.controller.js';
import { CoursService } from './cours.service.js';

@Module({
  controllers: [CoursController],
  providers: [CoursService],
})
export class CoursModule {}
