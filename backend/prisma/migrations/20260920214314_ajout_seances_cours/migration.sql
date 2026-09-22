-- CreateEnum
CREATE TYPE "StatutSeance" AS ENUM ('DECLAREE', 'VALIDEE', 'REJETEE', 'ANNULEE');

-- CreateTable
CREATE TABLE "SeanceCours" (
    "id" SERIAL NOT NULL,
    "dateSeance" TIMESTAMP(3) NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "dureeMinutes" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "observations" TEXT,
    "statut" "StatutSeance" NOT NULL DEFAULT 'DECLAREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "affectationId" INTEGER NOT NULL,

    CONSTRAINT "SeanceCours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SeanceCours_affectationId_idx" ON "SeanceCours"("affectationId");

-- CreateIndex
CREATE INDEX "SeanceCours_dateSeance_idx" ON "SeanceCours"("dateSeance");

-- CreateIndex
CREATE INDEX "SeanceCours_statut_idx" ON "SeanceCours"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "SeanceCours_affectationId_dateSeance_heureDebut_key" ON "SeanceCours"("affectationId", "dateSeance", "heureDebut");

-- AddForeignKey
ALTER TABLE "SeanceCours" ADD CONSTRAINT "SeanceCours_affectationId_fkey" FOREIGN KEY ("affectationId") REFERENCES "AffectationEnseignement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
