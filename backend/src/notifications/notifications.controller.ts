import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly service:
      NotificationsService,
  ) {}

  @Get('me')
  mesNotifications(
    @Req()
    request: any,
  ) {
    return this.service
      .mesNotifications(
        request.user.id,
      );
  }

  @Get('me/non-lues')
  nonLues(
    @Req()
    request: any,
  ) {
    return this.service
      .mesNotifications(
        request.user.id,
        true,
      );
  }

  @Get('me/compteur')
  compteur(
    @Req()
    request: any,
  ) {
    return this.service
      .nombreNonLues(
        request.user.id,
      );
  }

  @Patch(':id/lire')
  lire(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: any,
  ) {
    return this.service
      .marquerCommeLue(
        id,
        request.user.id,
      );
  }

  @Patch('me/tout-lire')
  toutLire(
    @Req()
    request: any,
  ) {
    return this.service
      .toutMarquerCommeLu(
        request.user.id,
      );
  }

  @Delete(':id')
  supprimer(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: any,
  ) {
    return this.service
      .supprimer(
        id,
        request.user.id,
      );
  }

  @Permissions('NOTIFICATIONS_GERER')
  @Post()
  creer(
    @Body()
    dto: CreateNotificationDto,
  ) {
    return this.service
      .creer(dto);
  }
}
