import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
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
  Request,
  Response,
} from 'express';

import {
  Public,
} from '../auth/decorators/public.decorator.js';

import {
  Permissions,
} from '../auth/decorators/permissions.decorator.js';

import {
  BrandingService,
} from './branding.service.js';

import {
  UpdateBrandingDto,
} from './dto/update-branding.dto.js';

@Controller('branding')
export class BrandingController {
  constructor(
    private readonly service:
      BrandingService,
  ) {}

  @Public()
  @Get('public')
  publicBranding() {
    return this.service
      .getPublic();
  }

  @Public()
  @Get('assets/:filename')
  async asset(
    @Req()
    request:
      Request,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const filename =
      String(
        request.params
          .filename ??
        '',
      );

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
    'BRANDING_GERER',
  )
  getAdmin() {
    return this.service
      .getAdmin();
  }

  @Patch()
  @Permissions(
    'BRANDING_GERER',
  )
  update(
    @Body()
    dto:
      UpdateBrandingDto,

    @Req()
    request: any,
  ) {
    return this.service
      .update(
        dto,
        request.user
          ?.email,
      );
  }

  @Post('logo')
  @Permissions(
    'BRANDING_GERER',
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
  uploadLogo(
    @UploadedFile()
    file: any,

    @Req()
    request: any,
  ) {
    return this.service
      .saveAsset(
        'logo',
        file,
        request.user
          ?.email,
      );
  }

  @Post('hero')
  @Permissions(
    'BRANDING_GERER',
  )
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        limits: {
          fileSize:
            8 *
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
  uploadHero(
    @UploadedFile()
    file: any,

    @Req()
    request: any,
  ) {
    return this.service
      .saveAsset(
        'hero',
        file,
        request.user
          ?.email,
      );
  }

  @Post('restaurer')
  @Permissions(
    'BRANDING_GERER',
  )
  restore(
    @Req()
    request: any,
  ) {
    return this.service
      .restoreDefaults(
        request.user
          ?.email,
      );
  }
}
