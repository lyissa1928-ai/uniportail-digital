import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import type {
  Response,
} from 'express';

import {
  Public,
} from '../auth/decorators/public.decorator.js';

import {
  Permissions,
} from '../auth/decorators/permissions.decorator.js';

import {
  ActualitesService,
} from './actualites.service.js';

import {
  CreateActualiteDto,
} from './dto/create-actualite.dto.js';

import {
  UpdateActualiteDto,
} from './dto/update-actualite.dto.js';

@Controller('actualites')
export class ActualitesController {
  constructor(
    private readonly service:
      ActualitesService,
  ) {}

  @Public()
  @Get('public')
  publicList(
    @Query('limit')
    limit?: string,
  ) {
    return this.service
      .publicList(
        Number(limit) ||
        3,
      );
  }

  @Public()
  @Get('assets/:filename')
  async asset(
    @Param('filename')
    filename:
      string,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const asset =
      await this.service
        .readAsset(
          filename,
        );

    response.setHeader(
      'Content-Type',
      asset.contentType,
    );

    response.setHeader(
      'Cache-Control',
      'public, max-age=3600',
    );

    return new StreamableFile(
      asset.buffer,
    );
  }

  @Get()
  @Permissions(
    'ACTUALITES_GERER',
  )
  list() {
    return this.service
      .list();
  }

  @Post()
  @Permissions(
    'ACTUALITES_GERER',
  )
  create(
    @Body()
    dto:
      CreateActualiteDto,

    @Req()
    request:
      any,
  ) {
    return this.service
      .create(
        dto,
        request.user,
      );
  }

  @Patch(':id')
  @Permissions(
    'ACTUALITES_GERER',
  )
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,

    @Body()
    dto:
      UpdateActualiteDto,

    @Req()
    request:
      any,
  ) {
    return this.service
      .update(
        id,
        dto,
        request.user,
      );
  }

  @Post(':id/image')
  @Permissions(
    'ACTUALITES_GERER',
  )
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        limits: {
          fileSize:
            5 *
            1024 *
            1024,
        },

        fileFilter: (
          _request,
          file,
          callback,
        ) => {
          callback(
            null,
            [
              'image/png',
              'image/jpeg',
              'image/webp',
            ].includes(
              file.mimetype,
            ),
          );
        },
      },
    ),
  )
  uploadImage(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,

    @UploadedFile()
    file:
      any,

    @Req()
    request:
      any,
  ) {
    return this.service
      .saveImage(
        id,
        file,
        request.user,
      );
  }

  @Delete(':id')
  @Permissions(
    'ACTUALITES_GERER',
  )
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id:
      number,

    @Req()
    request:
      any,
  ) {
    return this.service
      .remove(
        id,
        request.user,
      );
  }
}
