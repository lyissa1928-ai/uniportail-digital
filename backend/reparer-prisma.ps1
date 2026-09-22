$root = "C:\Users\lyiss\Desktop\projet IA\suivit evaluations\backend"
Set-Location $root

$schemaPath = Join-Path $root "prisma\schema.prisma"

Write-Host ""
Write-Host "=============================================="
Write-Host " REPARATION DU SCHEMA PRISMA"
Write-Host "=============================================="
Write-Host ""

# ============================================================
# SCHEMA PRISMA COMPLET ET PROPRE
# ============================================================

$schema = @'
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Filiere {
  id          Int         @id @default(autoincrement())
  code        String      @unique
  nom         String
  description String?
  actif       Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  formations Formation[]
}

model Formation {
  id          Int       @id @default(autoincrement())
  code        String    @unique
  nom         String
  description String?
  actif       Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  filiereId Int
  filiere   Filiere @relation(fields: [filiereId], references: [id])

  niveaux Niveau[]
}

model Niveau {
  id       Int     @id @default(autoincrement())
  code     String
  nom      String
  ordre    Int
  terminal Boolean @default(false)
  actif    Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  formationId Int
  formation   Formation @relation(fields: [formationId], references: [id])

  classes Classe[]
  cours   Cours[]

  @@unique([formationId, code])
}

model Classe {
  id    Int    @id @default(autoincrement())
  code  String
  nom   String
  annee String
  actif Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  niveauId Int
  niveau   Niveau @relation(fields: [niveauId], references: [id])

  affectations AffectationEnseignement[]

  @@unique([niveauId, code, annee])
}

model Cours {
  id            Int    @id @default(autoincrement())
  code          String
  intitule      String
  volumeHoraire Int
  credits       Int
  semestre      Int
  actif         Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  niveauId Int
  niveau   Niveau @relation(fields: [niveauId], references: [id])

  affectations AffectationEnseignement[]

  @@unique([niveauId, code])
}

model Enseignant {
  id         Int     @id @default(autoincrement())
  matricule  String  @unique
  nom        String
  prenom     String
  email      String? @unique
  telephone  String?
  specialite String?
  statut     String?
  actif      Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  affectations AffectationEnseignement[]
}

model AffectationEnseignement {
  id              Int     @id @default(autoincrement())
  anneeAcademique String
  actif           Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  enseignantId Int
  coursId      Int
  classeId     Int

  enseignant Enseignant @relation(fields: [enseignantId], references: [id], onDelete: Restrict)
  cours      Cours      @relation(fields: [coursId], references: [id], onDelete: Restrict)
  classe     Classe     @relation(fields: [classeId], references: [id], onDelete: Restrict)

  @@unique([enseignantId, coursId, classeId, anneeAcademique])
  @@index([enseignantId])
  @@index([coursId])
  @@index([classeId])
  @@index([anneeAcademique])
}
'@

# ============================================================
# ECRITURE UTF-8 SANS BOM
# ============================================================

$utf8SansBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
    $schemaPath,
    $schema,
    $utf8SansBom
)

Write-Host "[OK] schema.prisma reecrit en UTF-8 sans BOM"

# ============================================================
# VALIDATION
# ============================================================

Write-Host ""
Write-Host "Validation Prisma..."

npx prisma validate

if ($LASTEXITCODE -ne 0) {
    throw "Le schema Prisma est encore invalide."
}

Write-Host ""
Write-Host "[OK] Schema Prisma valide"

# ============================================================
# MIGRATION
# ============================================================

Write-Host ""
Write-Host "Migration de AffectationEnseignement..."

npx prisma migrate dev --name ajout_affectations_pedagogiques

if ($LASTEXITCODE -ne 0) {
    throw "La migration Prisma a echoue."
}

Write-Host ""
Write-Host "[OK] Migration appliquee"

# ============================================================
# GENERATION DU CLIENT
# ============================================================

Write-Host ""
Write-Host "Generation du Prisma Client..."

npx prisma generate

if ($LASTEXITCODE -ne 0) {
    throw "prisma generate a echoue."
}

Write-Host ""
Write-Host "[OK] Prisma Client genere"

# ============================================================
# BUILD NESTJS
# ============================================================

Remove-Item ".\dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item ".\tsconfig.build.tsbuildinfo" -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Compilation NestJS..."

npm run build

if ($LASTEXITCODE -ne 0) {
    throw "Le build NestJS a echoue."
}

Write-Host ""
Write-Host "=============================================="
Write-Host " REPARATION TERMINEE AVEC SUCCES"
Write-Host "=============================================="
Write-Host ""
Write-Host "Models presents :"
Write-Host " - Filiere"
Write-Host " - Formation"
Write-Host " - Niveau"
Write-Host " - Classe"
Write-Host " - Cours"
Write-Host " - Enseignant"
Write-Host " - AffectationEnseignement"
Write-Host ""