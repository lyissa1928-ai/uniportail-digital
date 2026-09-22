import {
  Module,
} from '@nestjs/common';

import {
  ActualitesController,
} from './actualites.controller.js';

import {
  ActualitesService,
} from './actualites.service.js';

@Module({
  controllers: [
    ActualitesController,
  ],

  providers: [
    ActualitesService,
  ],
})
export class ActualitesModule {}
