$root = "C:\Users\lyiss\Desktop\projet IA\suivit evaluations\backend"
Set-Location $root

$schemaPath = Join-Path $root "prisma\schema.prisma"

Write-Host ""
Write-Host "===================================================="
Write-Host " CREATION DU MODULE SEANCES / SUIVI DES COURS"
Write-Host "===================================================="
Write-Host ""

# ============================================================
# 1. SAUVEGARDE DU SCHEMA PRISMA
# ============================================================

Copy-Item `
    $schemaPath `
    "$schemaPath.backup-seances" `
    -Force

Write-Host "[OK] Sauvegarde schema.prisma effectuee"

# ============================================================
# 2. LECTURE DU SCHEMA
# ============================================================

$schema = [System.IO.File]::ReadAllText($schemaPath)

# ============================================================
# 3. AJOUT DE LA RELATION SEANCES DANS AFFECTATION
# ============================================================

if ($schema -notmatch "seances\s+SeanceCours\[\]") {

    $pattern = "(?ms)(model\s+AffectationEnseignement\s+\{.*?)(\r?\n\})"

    if ($schema -match $pattern) {

        $replacement =
            '${1}' +
            "`r`n  seances SeanceCours[]" +
            '${2}'

        $schema = [regex]::Replace(
            $schema,
            $pattern,
            $replacement,
            1
        )

        Write-Host "[OK] Relation seances ajoutee a AffectationEnseignement"
    }
    else {
        throw "Le modele AffectationEnseignement est introuvable."
    }
}
else {
    Write-Host "[OK] Relation seances deja presente"
}

# ============================================================
# 4. AJOUT DE L'ENUM STATUT
# ============================================================

if ($schema -notmatch "enum\s+StatutSeance\s+\{") {

$enumStatut = @'

enum StatutSeance {
  DECLAREE
  VALIDEE
  REJETEE
  ANNULEE
}
'@

    $schema += $enumStatut

    Write-Host "[OK] Enum StatutSeance ajoute"
}
else {
    Write-Host "[OK] Enum StatutSeance deja present"
}

# ============================================================
# 5. AJOUT DU MODELE SEANCE
# ============================================================

if ($schema -notmatch "model\s+SeanceCours\s+\{") {

$modelSeance = @'

model SeanceCours {
  id             Int          @id @default(autoincrement())
  dateSeance     DateTime
  heureDebut     String
  heureFin       String
  dureeMinutes   Int
  contenu        String
  observations   String?
  statut         StatutSeance @default(DECLAREE)

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  affectationId  Int
  affectation    AffectationEnseignement @relation(fields: [affectationId], references: [id], onDelete: Restrict)

  @@unique([affectationId, dateSeance, heureDebut])
  @@index([affectationId])
  @@index([dateSeance])
  @@index([statut])
}
'@

    $schema += $modelSeance

    Write-Host "[OK] Modele SeanceCours ajoute"
}
else {
    Write-Host "[OK] Modele SeanceCours deja present"
}

# ============================================================
# 6. ECRITURE UTF-8 SANS BOM
# ============================================================

$utf8SansBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
    $schemaPath,
    $schema,
    $utf8SansBom
)

Write-Host "[OK] schema.prisma enregistre en UTF-8 sans BOM"

# ============================================================
# 7. VALIDATION PRISMA
# ============================================================

Write-Host ""
Write-Host "Validation du schema Prisma..."

npx prisma validate

if ($LASTEXITCODE -ne 0) {
    throw "Schema Prisma invalide."
}

Write-Host "[OK] Schema Prisma valide"

# ============================================================
# 8. MIGRATION
# ============================================================

Write-Host ""
Write-Host "Creation de la migration..."

npx prisma migrate dev --name ajout_seances_cours

if ($LASTEXITCODE -ne 0) {
    throw "Migration Prisma echouee."
}

Write-Host "[OK] Migration appliquee"

# ============================================================
# 9. GENERATION CLIENT PRISMA
# ============================================================

npx prisma generate

if ($LASTEXITCODE -ne 0) {
    throw "Generation Prisma Client echouee."
}

Write-Host "[OK] Prisma Client regenere"

# ============================================================
# 10. CREATION DU MODULE
# ============================================================

New-Item `
    -ItemType Directory `
    -Force `
    -Path ".\src\seances\dto" |
    Out-Null

# ============================================================
# 11. DTO CREATE
# ============================================================

@'
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSeanceDto {
  @IsInt()
  @IsPositive()
  affectationId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date doit être au format AAAA-MM-JJ',
  })
  dateSeance: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure de début doit être au format HH:mm",
  })
  heureDebut: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure de fin doit être au format HH:mm",
  })
  heureFin: string;

  @IsString()
  @IsNotEmpty()
  contenu: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  observations?: string;
}
'@ | Set-Content `
    -Encoding UTF8 `
    ".\src\seances\dto\create-seance.dto.ts"

# ============================================================
# 12. DTO UPDATE
# ============================================================

@'
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateSeanceDto {
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date doit être au format AAAA-MM-JJ',
  })
  dateSeance?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure de début doit être au format HH:mm",
  })
  heureDebut?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure de fin doit être au format HH:mm",
  })
  heureFin?: string;

  @IsString()
  @IsOptional()
  contenu?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  observations?: string;
}
'@ | Set-Content `
    -Encoding UTF8 `
    ".\src\seances\dto\update-seance.dto.ts"

# ============================================================
# 13. SERVICE
# ============================================================

@'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSeanceDto } from './dto/create-seance.dto.js';
import { UpdateSeanceDto } from './dto/update-seance.dto.js';

@Injectable()
export class SeancesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private calculerDuree(
    heureDebut: string,
    heureFin: string,
  ): number {
    const [hd, md] = heureDebut
      .split(':')
      .map(Number);

    const [hf, mf] = heureFin
      .split(':')
      .map(Number);

    const debut = hd * 60 + md;
    const fin = hf * 60 + mf;

    const duree = fin - debut;

    if (duree <= 0) {
      throw new BadRequestException(
        "L'heure de fin doit être postérieure à l'heure de début",
      );
    }

    if (duree > 720) {
      throw new BadRequestException(
        'Une séance ne peut pas dépasser 12 heures',
      );
    }

    return duree;
  }

  async create(dto: CreateSeanceDto) {
    const affectation =
      await this.prisma.affectationEnseignement.findUnique({
        where: {
          id: dto.affectationId,
        },

        include: {
          cours: true,
          classe: true,
          enseignant: true,
        },
      });

    if (!affectation) {
      throw new NotFoundException(
        `Affectation ${dto.affectationId} introuvable`,
      );
    }

    if (!affectation.actif) {
      throw new ConflictException(
        'Cette affectation pédagogique est inactive',
      );
    }

    const dateSeance =
      new Date(`${dto.dateSeance}T00:00:00.000Z`);

    if (Number.isNaN(dateSeance.getTime())) {
      throw new BadRequestException(
        'Date de séance invalide',
      );
    }

    const dureeMinutes =
      this.calculerDuree(
        dto.heureDebut,
        dto.heureFin,
      );

    const existing =
      await this.prisma.seanceCours.findFirst({
        where: {
          affectationId: dto.affectationId,
          dateSeance,
          heureDebut: dto.heureDebut,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Une séance existe déjà à cette date et cette heure',
      );
    }

    return this.prisma.seanceCours.create({
      data: {
        affectationId:
          dto.affectationId,

        dateSeance,

        heureDebut:
          dto.heureDebut,

        heureFin:
          dto.heureFin,

        dureeMinutes,

        contenu:
          dto.contenu.trim(),

        observations:
          dto.observations?.trim(),

        statut:
          'DECLAREE',
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

  async findAll() {
    return this.prisma.seanceCours.findMany({
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
          dateSeance: 'desc',
        },
        {
          heureDebut: 'desc',
        },
      ],
    });
  }

  async findOne(id: number) {
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
        `Séance ${id} introuvable`,
      );
    }

    return seance;
  }

  async findByAffectation(
    affectationId: number,
  ) {
    const affectation =
      await this.prisma.affectationEnseignement.findUnique({
        where: {
          id: affectationId,
        },
      });

    if (!affectation) {
      throw new NotFoundException(
        `Affectation ${affectationId} introuvable`,
      );
    }

    return this.prisma.seanceCours.findMany({
      where: {
        affectationId,
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

  async progression(
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

          seances: {
            orderBy: {
              dateSeance: 'asc',
            },
          },
        },
      });

    if (!affectation) {
      throw new NotFoundException(
        `Affectation ${affectationId} introuvable`,
      );
    }

    const volumePrevuMinutes =
      affectation.cours.volumeHoraire * 60;

    const minutesDeclarees =
      affectation.seances
        .filter(
          (seance) =>
            seance.statut === 'DECLAREE' ||
            seance.statut === 'VALIDEE',
        )
        .reduce(
          (total, seance) =>
            total + seance.dureeMinutes,
          0,
        );

    const minutesValidees =
      affectation.seances
        .filter(
          (seance) =>
            seance.statut === 'VALIDEE',
        )
        .reduce(
          (total, seance) =>
            total + seance.dureeMinutes,
          0,
        );

    const minutesRestantes =
      Math.max(
        0,
        volumePrevuMinutes - minutesValidees,
      );

    const tauxDeclare =
      volumePrevuMinutes === 0
        ? 0
        : Number(
            (
              (minutesDeclarees /
                volumePrevuMinutes) *
              100
            ).toFixed(2),
          );

    const tauxValide =
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

      enseignant: {
        id:
          affectation.enseignant.id,

        matricule:
          affectation.enseignant.matricule,

        nom:
          affectation.enseignant.nom,

        prenom:
          affectation.enseignant.prenom,
      },

      cours: {
        id:
          affectation.cours.id,

        code:
          affectation.cours.code,

        intitule:
          affectation.cours.intitule,

        volumeHoraire:
          affectation.cours.volumeHoraire,

        credits:
          affectation.cours.credits,
      },

      classe: {
        id:
          affectation.classe.id,

        code:
          affectation.classe.code,

        nom:
          affectation.classe.nom,
      },

      anneeAcademique:
        affectation.anneeAcademique,

      volumePrevuHeures:
        affectation.cours.volumeHoraire,

      heuresDeclarees:
        Number(
          (minutesDeclarees / 60).toFixed(2),
        ),

      heuresValidees:
        Number(
          (minutesValidees / 60).toFixed(2),
        ),

      heuresRestantes:
        Number(
          (minutesRestantes / 60).toFixed(2),
        ),

      tauxExecutionDeclare:
        tauxDeclare,

      tauxExecutionValide:
        tauxValide,

      nombreSeances:
        affectation.seances.length,

      depassement:
        minutesValidees >
        volumePrevuMinutes,
    };
  }

  async update(
    id: number,
    dto: UpdateSeanceDto,
  ) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'VALIDEE') {
      throw new ConflictException(
        'Une séance validée ne peut plus être modifiée directement',
      );
    }

    if (seance.statut === 'ANNULEE') {
      throw new ConflictException(
        'Une séance annulée ne peut pas être modifiée',
      );
    }

    const heureDebut =
      dto.heureDebut ??
      seance.heureDebut;

    const heureFin =
      dto.heureFin ??
      seance.heureFin;

    const dureeMinutes =
      this.calculerDuree(
        heureDebut,
        heureFin,
      );

    const dateSeance =
      dto.dateSeance
        ? new Date(
            `${dto.dateSeance}T00:00:00.000Z`,
          )
        : seance.dateSeance;

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        dateSeance,
        heureDebut:
          dto.heureDebut,

        heureFin:
          dto.heureFin,

        dureeMinutes,

        contenu:
          dto.contenu?.trim(),

        observations:
          dto.observations?.trim(),
      },
    });
  }

  async valider(id: number) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'ANNULEE') {
      throw new ConflictException(
        'Une séance annulée ne peut pas être validée',
      );
    }

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        statut: 'VALIDEE',
      },
    });
  }

  async rejeter(id: number) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'VALIDEE') {
      throw new ConflictException(
        'Une séance déjà validée ne peut pas être rejetée directement',
      );
    }

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        statut: 'REJETEE',
      },
    });
  }

  async annuler(id: number) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'VALIDEE') {
      throw new ConflictException(
        'Une séance validée ne peut pas être annulée directement',
      );
    }

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        statut: 'ANNULEE',
      },
    });
  }

  async remove(id: number) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'VALIDEE') {
      throw new ConflictException(
        'Impossible de supprimer une séance validée',
      );
    }

    return this.prisma.seanceCours.delete({
      where: {
        id,
      },
    });
  }
}
'@ | Set-Content `
    -Encoding UTF8 `
    ".\src\seances\seances.service.ts"

# ============================================================
# 14. CONTROLLER
# ============================================================

@'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { SeancesService } from './seances.service.js';
import { CreateSeanceDto } from './dto/create-seance.dto.js';
import { UpdateSeanceDto } from './dto/update-seance.dto.js';

@Controller('seances')
export class SeancesController {
  constructor(
    private readonly seancesService:
      SeancesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateSeanceDto,
  ) {
    return this.seancesService.create(dto);
  }

  @Get()
  findAll() {
    return this.seancesService.findAll();
  }

  @Get('affectation/:affectationId/progression')
  progression(
    @Param(
      'affectationId',
      ParseIntPipe,
    )
    affectationId: number,
  ) {
    return this.seancesService.progression(
      affectationId,
    );
  }

  @Get('affectation/:affectationId')
  findByAffectation(
    @Param(
      'affectationId',
      ParseIntPipe,
    )
    affectationId: number,
  ) {
    return this.seancesService.findByAffectation(
      affectationId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateSeanceDto,
  ) {
    return this.seancesService.update(
      id,
      dto,
    );
  }

  @Patch(':id/valider')
  valider(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.valider(id);
  }

  @Patch(':id/rejeter')
  rejeter(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.rejeter(id);
  }

  @Patch(':id/annuler')
  annuler(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.annuler(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.seancesService.remove(id);
  }
}
'@ | Set-Content `
    -Encoding UTF8 `
    ".\src\seances\seances.controller.ts"

# ============================================================
# 15. MODULE
# ============================================================

@'
import { Module } from '@nestjs/common';

import { SeancesController } from './seances.controller.js';
import { SeancesService } from './seances.service.js';

@Module({
  controllers: [
    SeancesController,
  ],

  providers: [
    SeancesService,
  ],
})
export class SeancesModule {}
'@ | Set-Content `
    -Encoding UTF8 `
    ".\src\seances\seances.module.ts"

# ============================================================
# 16. AJOUT AUTOMATIQUE DANS APP.MODULE.TS
# ============================================================

$appModulePath = ".\src\app.module.ts"
$appModule = Get-Content $appModulePath -Raw

if (
    $appModule -notmatch
    "SeancesModule"
) {

    $appModule =
        $appModule -replace `
        "import \{ Module \} from '@nestjs/common';", `
        "import { Module } from '@nestjs/common';`r`nimport { SeancesModule } from './seances/seances.module.js';"

    $appModule =
        $appModule -replace `
        "imports:\s*\[", `
        "imports: [`r`n    SeancesModule,"

    $utf8SansBom =
        New-Object System.Text.UTF8Encoding($false)

    [System.IO.File]::WriteAllText(
        (Resolve-Path $appModulePath),
        $appModule,
        $utf8SansBom
    )

    Write-Host "[OK] SeancesModule ajoute a AppModule"
}
else {
    Write-Host "[OK] SeancesModule deja dans AppModule"
}

# ============================================================
# 17. NETTOYAGE + BUILD
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

Write-Host ""
Write-Host "Compilation NestJS..."

npm run build

if ($LASTEXITCODE -ne 0) {
    throw "Build NestJS echoue."
}

# ============================================================
# 18. RESULTAT
# ============================================================

Write-Host ""
Write-Host "===================================================="
Write-Host " MODULE SEANCES CREE AVEC SUCCES"
Write-Host "===================================================="
Write-Host ""
Write-Host "POST   /api/seances"
Write-Host "GET    /api/seances"
Write-Host "GET    /api/seances/:id"
Write-Host "GET    /api/seances/affectation/:id"
Write-Host "GET    /api/seances/affectation/:id/progression"
Write-Host "PATCH  /api/seances/:id"
Write-Host "PATCH  /api/seances/:id/valider"
Write-Host "PATCH  /api/seances/:id/rejeter"
Write-Host "PATCH  /api/seances/:id/annuler"
Write-Host "DELETE /api/seances/:id"
Write-Host ""
Write-Host "Demarrage..."
Write-Host ""

npm run start:dev