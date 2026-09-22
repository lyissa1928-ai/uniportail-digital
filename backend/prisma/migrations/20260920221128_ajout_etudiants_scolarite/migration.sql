-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('ACTIVE', 'SUSPENDUE', 'ABANDONNEE', 'TERMINEE');

-- CreateTable
CREATE TABLE "Etudiant" (
    "id" SERIAL NOT NULL,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "email" TEXT,
    "telephone" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Etudiant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscriptionEtudiant" (
    "id" SERIAL NOT NULL,
    "anneeAcademique" TEXT NOT NULL,
    "statut" "StatutInscription" NOT NULL DEFAULT 'ACTIVE',
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "classeId" INTEGER NOT NULL,

    CONSTRAINT "InscriptionEtudiant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_matricule_key" ON "Etudiant"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_email_key" ON "Etudiant"("email");

-- CreateIndex
CREATE INDEX "InscriptionEtudiant_etudiantId_idx" ON "InscriptionEtudiant"("etudiantId");

-- CreateIndex
CREATE INDEX "InscriptionEtudiant_classeId_idx" ON "InscriptionEtudiant"("classeId");

-- CreateIndex
CREATE INDEX "InscriptionEtudiant_anneeAcademique_idx" ON "InscriptionEtudiant"("anneeAcademique");

-- CreateIndex
CREATE INDEX "InscriptionEtudiant_statut_idx" ON "InscriptionEtudiant"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "InscriptionEtudiant_etudiantId_anneeAcademique_key" ON "InscriptionEtudiant"("etudiantId", "anneeAcademique");

-- AddForeignKey
ALTER TABLE "InscriptionEtudiant" ADD CONSTRAINT "InscriptionEtudiant_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscriptionEtudiant" ADD CONSTRAINT "InscriptionEtudiant_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
