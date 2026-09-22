import { Module } from '@nestjs/common';
import { FormationsController } from './formations.controller.js';
import { FormationsService } from './formations.service.js';

@Module({
  controllers: [FormationsController],
  providers: [FormationsService],
})
export class FormationsModule {}