$root = "C:\Users\lyiss\Desktop\projet IA\suivit evaluations\backend"
Set-Location $root

$schemaPath = Join-Path $root "prisma\schema.prisma"

Write-Host ""
Write-Host "=================================================="
Write-Host " CREATION DU MODULE PEDAGOGIE"
Write-Host "=================================================="
Write-Host ""

# ============================================================
# 1. SAUVEGARDE PRISMA
# ============================================================

Copy-Item `
    $schemaPath `
    "$schemaPath.backup-pedagogie" `
    -Force

Write-Host "[OK] Sauvegarde du schema Prisma"

# ============================================================
# 2. AJOUT DES INFORMATIONS DE VALIDATION
# ============================================================

$schema = [System.IO.File]::ReadAllText($schemaPath)

if ($schema -notmatch "motifRejet\s+String\?") {

    $schema = $schema -replace `
        "observations\s+String\?", `
@'
observations   String?
  motifRejet     String?
  valideeLe      DateTime?
  rejeteeLe      DateTime?
'@

    Write-Host "[OK] Champs de validation pedagogique ajoutes"
}
else {
    Write-Host "[OK] Champs pedagogiques deja presents"
}

# ============================================================
# 3. ECRITURE UTF-8 SANS BOM
# ============================================================

$utf8SansBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
    $schemaPath,
    $schema,
    $utf8SansBom
)

# ============================================================
# 4. VALIDATION PRISMA
# ============================================================

Write-Host ""
Write-Host "Validation Prisma..."

npx prisma validate

if ($LASTEXITCODE -ne 0) {
    throw "Schema Prisma invalide."
}

Write-Host "[OK] Schema Prisma valide"

# ============================================================
# 5. MIGRATION
# ============================================================

Write-Host ""
Write-Host "Migration pedagogique..."

npx prisma migrate dev --name ajout_validation_pedagogique

if ($LASTEXITCODE -ne 0) {
    throw "Migration Prisma echouee."
}

Write-Host "[OK] Migration appliquee"

# ============================================================
# 6. GENERATION PRISMA CLIENT
# ============================================================

npx prisma generate

if ($LASTEXITCODE -ne 0) {
    throw "Generation Prisma Client echouee."
}

Write-Host "[OK] Prisma Client genere"

# ============================================================
# 7. CREATION STRUCTURE
# ============================================================

New-Item `
    -ItemType Directory `
    -Force `
    -Path ".\src\pedagogie\dto" |
    Out-Null

# ============================================================
# 8. DTO REJET
# ============================================================

@'
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class RejeterSeanceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  motif: string;
}
'@ | Set-Content `
    -Encoding UTF8 `
    ".\src\pedagogie\dto\rejeter-seance.dto.ts"

# ============================================================
# 9. SERVICE PEDAGOGIE
# ============================================================

@'
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PedagogieService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async getSeance(id: number) {
    const seance =
      await this.prisma.seanceCours.findUnique({
        where: {
          id,
        },

        include: {
          affectation: {
            include: {
              enseignant: true,
              cours: {
                include: {
                  niveau: {
                    include: {
                      formation: {
                        include: {
                          filiere: true,
                        },
                      },
                    },
                  },
                },
              },
              classe: true,
            },
          },
        },
      });

    if (!seance) {
      throw new NotFoundException(
        `Seance ${id} introuvable`,
      );
    }

    return seance;
  }

  async seancesEnAttente() {
    return this.prisma.seanceCours.findMany({
      where: {
        statut: 'DECLAREE',
      },

      include: {
        affectation: {
          include: {
            enseignant: true,
            cours: {
              include: {
                niveau: {
                  include: {
                    formation: true,
                  },
                },
              },
            },
            classe: true,
          },
        },
      },

      orderBy: [
        {
          dateSeance: 'asc',
        },
        {
          heureDebut: 'asc',
        },
      ],
    });
  }

  async validerSeance(id: number) {
    const seance = await this.getSeance(id);

    if (seance.statut === 'VALIDEE') {
      return seance;
    }

    if (seance.statut === 'ANNULEE') {
      throw new ConflictException(
        'Une seance annulee ne peut pas etre validee',
      );
    }

    if (seance.statut === 'REJETEE') {
      throw new ConflictException(
        "La seance rejetee doit d'abord etre remise en attente",
      );
    }

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        statut: 'VALIDEE',
        valideeLe: new Date(),
        rejeteeLe: null,
        motifRejet: null,
      },

      include: {
        affectation: {
          include: {
            enseignant: true,
            cours: true,
            classe: true,
          },
        },
      },
    });
  }

  async rejeterSeance(
    id: number,
    motif: string,
  ) {
    const seance = await this.getSeance(id);

    if (seance.statut === 'VALIDEE') {
      throw new ConflictException(
        'Une seance validee ne peut pas etre rejetee directement',
      );
    }

    if (seance.statut === 'ANNULEE') {
      throw new ConflictException(
        'Une seance annulee ne peut pas etre rejetee',
      );
    }

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        statut: 'REJETEE',
        motifRejet: motif.trim(),
        rejeteeLe: new Date(),
        valideeLe: null,
      },
    });
  }

  async remettreEnAttente(id: number) {
    const seance = await this.getSeance(id);

    if (seance.statut !== 'REJETEE') {
      throw new ConflictException(
        'Seule une seance rejetee peut etre remise en attente',
      );
    }

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        statut: 'DECLAREE',
        motifRejet: null,
        rejeteeLe: null,
        valideeLe: null,
      },
    });
  }

  async progressionAffectation(
    affectationId: number,
  ) {
    const affectation =
      await this.prisma.affectationEnseignement.findUnique({
        where: {
          id: affectationId,
        },

        include: {
          enseignant: true,
          cours: true,
          classe: true,
          seances: true,
        },
      });

    if (!affectation) {
      throw new NotFoundException(
        `Affectation ${affectationId} introuvable`,
      );
    }

    const volumePrevuMinutes =
      affectation.cours.volumeHoraire * 60;

    const declarees =
      affectation.seances.filter(
        (s) => s.statut === 'DECLAREE',
      );

    const validees =
      affectation.seances.filter(
        (s) => s.statut === 'VALIDEE',
      );

    const rejetees =
      affectation.seances.filter(
        (s) => s.statut === 'REJETEE',
      );

    const minutesDeclarees =
      declarees.reduce(
        (total, s) =>
          total + s.dureeMinutes,
        0,
      );

    const minutesValidees =
      validees.reduce(
        (total, s) =>
          total + s.dureeMinutes,
        0,
      );

    const minutesRestantes =
      Math.max(
        0,
        volumePrevuMinutes -
          minutesValidees,
      );

    const tauxExecution =
      volumePrevuMinutes === 0
        ? 0
        : Number(
            (
              (minutesValidees /
                volumePrevuMinutes) *
              100
            ).toFixed(2),
          );

    return {
      affectationId:
        affectation.id,

      enseignant:
        affectation.enseignant,

      cours:
        affectation.cours,

      classe:
        affectation.classe,

      anneeAcademique:
        affectation.anneeAcademique,

      volumePrevuHeures:
        affectation.cours.volumeHoraire,

      heuresDeclarees:
        Number(
          (
            minutesDeclarees / 60
          ).toFixed(2),
        ),

      heuresValidees:
        Number(
          (
            minutesValidees / 60
          ).toFixed(2),
        ),

      heuresRestantes:
        Number(
          (
            minutesRestantes / 60
          ).toFixed(2),
        ),

      tauxExecution,

      nombreSeances:
        affectation.seances.length,

      nombreEnAttente:
        declarees.length,

      nombreValidees:
        validees.length,

      nombreRejetees:
        rejetees.length,

      depassement:
        minutesValidees >
        volumePrevuMinutes,
    };
  }

  async suiviClasse(classeId: number) {
    const classe =
      await this.prisma.classe.findUnique({
        where: {
          id: classeId,
        },

        include: {
          niveau: {
            include: {
              formation: {
                include: {
                  filiere: true,
                },
              },
            },
          },

          affectations: {
            include: {
              enseignant: true,
              cours: true,
              seances: true,
            },
          },
        },
      });

    if (!classe) {
      throw new NotFoundException(
        `Classe ${classeId} introuvable`,
      );
    }

    const suivis =
      classe.affectations.map(
        (affectation) => {
          const prevu =
            affectation.cours
              .volumeHoraire * 60;

          const valide =
            affectation.seances
              .filter(
                (s) =>
                  s.statut === 'VALIDEE',
              )
              .reduce(
                (total, s) =>
                  total +
                  s.dureeMinutes,
                0,
              );

          return {
            affectationId:
              affectation.id,

            enseignant:
              affectation.enseignant,

            cours:
              affectation.cours,

            heuresPrevues:
              affectation.cours
                .volumeHoraire,

            heuresValidees:
              Number(
                (
                  valide / 60
                ).toFixed(2),
              ),

            heuresRestantes:
              Number(
                (
                  Math.max(
                    0,
                    prevu - valide,
                  ) / 60
                ).toFixed(2),
              ),

            tauxExecution:
              prevu === 0
                ? 0
                : Number(
                    (
                      (valide /
                        prevu) *
                      100
                    ).toFixed(2),
                  ),

            termine:
              valide >= prevu,
          };
        },
      );

    const coursUniques =
      new Map<number, number>();

    for (
      const affectation
      of classe.affectations
    ) {
      coursUniques.set(
        affectation.cours.id,
        affectation.cours
          .volumeHoraire,
      );
    }

    const volumeTotalPrevu =
      Array.from(
        coursUniques.values(),
      ).reduce(
        (total, heures) =>
          total + heures,
        0,
      );

    const minutesValidees =
      classe.affectations.reduce(
        (total, affectation) =>
          total +
          affectation.seances
            .filter(
              (s) =>
                s.statut ===
                'VALIDEE',
            )
            .reduce(
              (somme, s) =>
                somme +
                s.dureeMinutes,
              0,
            ),
        0,
      );

    const tauxGlobal =
      volumeTotalPrevu === 0
        ? 0
        : Number(
            (
              (minutesValidees /
                (volumeTotalPrevu *
                  60)) *
              100
            ).toFixed(2),
          );

    return {
      classe: {
        id:
          classe.id,

        code:
          classe.code,

        nom:
          classe.nom,

        annee:
          classe.annee,
      },

      niveau:
        classe.niveau,

      volumeTotalPrevu,

      heuresTotalValidees:
        Number(
          (
            minutesValidees / 60
          ).toFixed(2),
        ),

      tauxExecutionGlobal:
        tauxGlobal,

      nombreCours:
        coursUniques.size,

      suivis,
    };
  }

  async suiviFormation(
    formationId: number,
  ) {
    const formation =
      await this.prisma.formation.findUnique({
        where: {
          id: formationId,
        },

        include: {
          filiere: true,

          niveaux: {
            include: {
              classes: {
                include: {
                  affectations: {
                    include: {
                      cours: true,
                      enseignant: true,
                      seances: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!formation) {
      throw new NotFoundException(
        `Formation ${formationId} introuvable`,
      );
    }

    let minutesValidees = 0;

    const coursPlanifies =
      new Map<string, number>();

    let nombreSeances = 0;
    let nombreValidees = 0;
    let nombreEnAttente = 0;
    let nombreRejetees = 0;

    for (
      const niveau
      of formation.niveaux
    ) {
      for (
        const classe
        of niveau.classes
      ) {
        for (
          const affectation
          of classe.affectations
        ) {
          const cle =
            `${classe.id}-${affectation.cours.id}`;

          coursPlanifies.set(
            cle,
            affectation.cours
              .volumeHoraire,
          );

          for (
            const seance
            of affectation.seances
          ) {
            nombreSeances++;

            if (
              seance.statut ===
              'VALIDEE'
            ) {
              nombreValidees++;

              minutesValidees +=
                seance.dureeMinutes;
            }

            if (
              seance.statut ===
              'DECLAREE'
            ) {
              nombreEnAttente++;
            }

            if (
              seance.statut ===
              'REJETEE'
            ) {
              nombreRejetees++;
            }
          }
        }
      }
    }

    const volumePrevu =
      Array.from(
        coursPlanifies.values(),
      ).reduce(
        (total, volume) =>
          total + volume,
        0,
      );

    const heuresValidees =
      Number(
        (
          minutesValidees / 60
        ).toFixed(2),
      );

    const tauxExecution =
      volumePrevu === 0
        ? 0
        : Number(
            (
              (minutesValidees /
                (volumePrevu * 60)) *
              100
            ).toFixed(2),
          );

    return {
      formation: {
        id:
          formation.id,

        code:
          formation.code,

        nom:
          formation.nom,

        filiere:
          formation.filiere,
      },

      nombreNiveaux:
        formation.niveaux.length,

      nombreClasses:
        formation.niveaux.reduce(
          (total, niveau) =>
            total +
            niveau.classes.length,
          0,
        ),

      nombreCoursPlanifies:
        coursPlanifies.size,

      volumePrevuHeures:
        volumePrevu,

      heuresValidees,

      tauxExecution,

      nombreSeances,
      nombreValidees,
      nombreEnAttente,
      nombreRejetees,
    };
  }
}
'@ | Set-Content `
    -Encoding UTF8 `
    ".\src\pedagogie\pedagogie.service.ts"

# ============================================================
# 10. CONTROLLER
# ============================================================

@'
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import { PedagogieService } from './pedagogie.service.js';
import { RejeterSeanceDto } from './dto/rejeter-seance.dto.js';

@Controller('pedagogie')
export class PedagogieController {
  constructor(
    private readonly pedagogieService:
      PedagogieService,
  ) {}

  @Get('seances/en-attente')
  seancesEnAttente() {
    return this.pedagogieService
      .seancesEnAttente();
  }

  @Patch('seances/:id/valider')
  valider(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .validerSeance(id);
  }

  @Patch('seances/:id/rejeter')
  rejeter(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: RejeterSeanceDto,
  ) {
    return this.pedagogieService
      .rejeterSeance(
        id,
        dto.motif,
      );
  }

  @Patch(
    'seances/:id/remettre-en-attente',
  )
  remettreEnAttente(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .remettreEnAttente(id);
  }

  @Get(
    'affectations/:id/progression',
  )
  progressionAffectation(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .progressionAffectation(id);
  }

  @Get('classes/:id/suivi')
  suiviClasse(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .suiviClasse(id);
  }

  @Get('formations/:id/suivi')
  suiviFormation(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.pedagogieService
      .suiviFormation(id);
  }
}
'@ | Set-Content `
    -Encoding UTF8 `
    ".\src\pedagogie\pedagogie.controller.ts"

# ============================================================
# 11. MODULE
# ============================================================

@'
import { Module } from '@nestjs/common';

import { PedagogieController } from './pedagogie.controller.js';
import { PedagogieService } from './pedagogie.service.js';

@Module({
  controllers: [
    PedagogieController,
  ],

  providers: [
    PedagogieService,
  ],
})
export class PedagogieModule {}
'@ | Set-Content `
    -Encoding UTF8 `
    ".\src\pedagogie\pedagogie.module.ts"

# ============================================================
# 12. AJOUT DANS APP.MODULE
# ============================================================

$appModulePath =
    ".\src\app.module.ts"

$appModule =
    Get-Content `
        $appModulePath `
        -Raw

if (
    $appModule -notmatch
    "PedagogieModule"
) {

    $appModule =
        $appModule -replace `
        "import \{ Module \} from '@nestjs/common';", `
        "import { Module } from '@nestjs/common';`r`nimport { PedagogieModule } from './pedagogie/pedagogie.module.js';"

    $appModule =
        $appModule -replace `
        "imports:\s*\[", `
        "imports: [`r`n    PedagogieModule,"

    $utf8SansBom =
        New-Object `
        System.Text.UTF8Encoding($false)

    [System.IO.File]::WriteAllText(
        (Resolve-Path $appModulePath),
        $appModule,
        $utf8SansBom
    )

    Write-Host `
        "[OK] PedagogieModule ajoute"
}
else {
    Write-Host `
        "[OK] PedagogieModule deja present"
}

# ============================================================
# 13. NETTOYAGE
# ============================================================

Remove-Item `
    ".\dist" `
    -Recurse `
    -Force `
    -ErrorAction SilentlyContinue

Remove-Item `
    ".\tsconfig.build.tsbuildinfo" `
    -Force `
    -ErrorAction SilentlyContinue

# ============================================================
# 14. BUILD
# ============================================================

Write-Host ""
Write-Host "Compilation NestJS..."

npm run build

if ($LASTEXITCODE -ne 0) {
    throw "Build NestJS echoue."
}

# ============================================================
# 15. RESULTAT
# ============================================================

Write-Host ""
Write-Host "=================================================="
Write-Host " MODULE PEDAGOGIE CREE AVEC SUCCES"
Write-Host "=================================================="
Write-Host ""
Write-Host "GET   /api/pedagogie/seances/en-attente"
Write-Host "PATCH /api/pedagogie/seances/:id/valider"
Write-Host "PATCH /api/pedagogie/seances/:id/rejeter"
Write-Host "PATCH /api/pedagogie/seances/:id/remettre-en-attente"
Write-Host "GET   /api/pedagogie/affectations/:id/progression"
Write-Host "GET   /api/pedagogie/classes/:id/suivi"
Write-Host "GET   /api/pedagogie/formations/:id/suivi"
Write-Host ""
Write-Host "Demarrage du backend..."
Write-Host ""

npm run start:dev