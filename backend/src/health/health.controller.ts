import {
  Controller,
  Get,
} from '@nestjs/common';

import {
  HealthCheck,
  HealthCheckService,
} from '@nestjs/terminus';

import {
  SkipThrottle,
} from '@nestjs/throttler';

import { Public } from '../auth/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health:
      HealthCheckService,

    private readonly prisma:
      PrismaService,
  ) {}

  @Public()
  @SkipThrottle()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => {
        await this.prisma
          .$queryRawUnsafe(
            'SELECT 1',
          );

        return {
          database: {
            status: 'up',
          },
        };
      },

      async () => ({
        api: {
          status: 'up',

          timestamp:
            new Date()
              .toISOString(),

          uptimeSeconds:
            Math.floor(
              process.uptime(),
            ),

          memoryMb: {
            rss:
              Math.round(
                process.memoryUsage()
                  .rss /
                1024 /
                1024,
              ),

            heapUsed:
              Math.round(
                process.memoryUsage()
                  .heapUsed /
                1024 /
                1024,
              ),
          },
        },
      }),
    ]);
  }
}
