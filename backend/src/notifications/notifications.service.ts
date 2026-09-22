import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async creer(
    dto: CreateNotificationDto,
  ) {
    const utilisateur =
      await this.prisma.utilisateur.findUnique({
        where: {
          id: dto.utilisateurId,
        },
      });

    if (!utilisateur) {
      throw new NotFoundException(
        `Utilisateur ${dto.utilisateurId} introuvable`,
      );
    }

    return this.prisma.notification.create({
      data: {
        utilisateurId:
          dto.utilisateurId,

        type:
          dto.type as any,

        titre:
          dto.titre.trim(),

        message:
          dto.message.trim(),

        lien:
          dto.lien?.trim(),

        donnees:
          dto.donnees as any,
      },
    });
  }

  async mesNotifications(
    utilisateurId: number,
    nonLuesSeulement = false,
  ) {
    return this.prisma.notification.findMany({
      where: {
        utilisateurId,

        ...(nonLuesSeulement
          ? {
              lu: false,
            }
          : {}),
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: 100,
    });
  }

  async nombreNonLues(
    utilisateurId: number,
  ) {
    const total =
      await this.prisma.notification.count({
        where: {
          utilisateurId,
          lu: false,
        },
      });

    return {
      nonLues: total,
    };
  }

  async marquerCommeLue(
    id: number,
    utilisateurId: number,
  ) {
    const notification =
      await this.prisma.notification.findUnique({
        where: {
          id,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        `Notification ${id} introuvable`,
      );
    }

    if (
      notification.utilisateurId !==
      utilisateurId
    ) {
      throw new ForbiddenException(
        "Cette notification n'appartient pas à l'utilisateur connecté",
      );
    }

    if (notification.lu) {
      return notification;
    }

    return this.prisma.notification.update({
      where: {
        id,
      },

      data: {
        lu: true,
        luLe: new Date(),
      },
    });
  }

  async toutMarquerCommeLu(
    utilisateurId: number,
  ) {
    await this.prisma.notification.updateMany({
      where: {
        utilisateurId,
        lu: false,
      },

      data: {
        lu: true,
        luLe: new Date(),
      },
    });

    return {
      message:
        'Toutes les notifications ont été marquées comme lues',
    };
  }

  async supprimer(
    id: number,
    utilisateurId: number,
  ) {
    const notification =
      await this.prisma.notification.findUnique({
        where: {
          id,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        `Notification ${id} introuvable`,
      );
    }

    if (
      notification.utilisateurId !==
      utilisateurId
    ) {
      throw new ForbiddenException(
        "Cette notification n'appartient pas à l'utilisateur connecté",
      );
    }

    return this.prisma.notification.delete({
      where: {
        id,
      },
    });
  }
}
