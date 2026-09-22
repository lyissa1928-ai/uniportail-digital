import { Module } from '@nestjs/common';

import { MonEspaceController } from './mon-espace.controller.js';
import { MonEspaceService } from './mon-espace.service.js';

@Module({
  controllers: [
    MonEspaceController,
  ],

  providers: [
    MonEspaceService,
  ],
})
export class MonEspaceModule {}
