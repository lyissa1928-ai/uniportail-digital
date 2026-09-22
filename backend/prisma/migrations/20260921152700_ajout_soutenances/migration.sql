-- CreateEnum
CREATE TYPE "DecisionSoutenance" AS ENUM ('EN_ATTENTE', 'ADMIS', 'AJOURNE', 'REFUSE');

-- CreateTable
CREATE TABLE "Soutenance" (
    "id" SERIAL NOT NULL,
    "sujet" TEXT NOT NULL,
    "dateSoutenance" TIMESTAMP(3) NOT NULL,
    "decision" "DecisionSoutenance" NOT NULL DEFAULT 'EN_ATTENTE',
    "note" DOUBLE PRECISION,
    "numeroPv" TEXT,
    "presidentJury" TEXT,
    "membresJury" TEXT,
    "observations" TEXT,
    "validee" BOOLEAN NOT NULL DEFAULT false,
    "valideePar" TEXT,
    "dateValidation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inscriptionId" INTEGER NOT NULL,

    CONSTRAINT "Soutenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Soutenance_inscriptionId_key" ON "Soutenance"("inscriptionId");

-- CreateIndex
CREATE INDEX "Soutenance_decision_idx" ON "Soutenance"("decision");

-- CreateIndex
CREATE INDEX "Soutenance_validee_idx" ON "Soutenance"("validee");

-- CreateIndex
CREATE INDEX "Soutenance_dateSoutenance_idx" ON "Soutenance"("dateSoutenance");

-- AddForeignKey
ALTER TABLE "Soutenance" ADD CONSTRAINT "Soutenance_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "InscriptionEtudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
