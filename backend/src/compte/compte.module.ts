import {
  Module,
} from '@nestjs/common';

import {
  PrismaModule,
} from '../prisma/prisma.module.js';

import {
  CompteController,
} from './compte.controller.js';

import {
  CompteService,
} from './compte.service.js';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    CompteController,
  ],

  providers: [
    CompteService,
  ],
})
export class CompteModule {}