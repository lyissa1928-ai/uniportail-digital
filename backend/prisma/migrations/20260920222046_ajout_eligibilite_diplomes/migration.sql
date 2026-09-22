-- CreateEnum
CREATE TYPE "DecisionAcademique" AS ENUM ('EN_ATTENTE', 'ADMIS', 'AJOURNE', 'REFUSE');

-- CreateTable
CREATE TABLE "ValidationAcademique" (
    "id" SERIAL NOT NULL,
    "decision" "DecisionAcademique" NOT NULL DEFAULT 'EN_ATTENTE',
    "creditsObtenus" INTEGER NOT NULL DEFAULT 0,
    "creditsRequis" INTEGER NOT NULL,
    "stageRequis" BOOLEAN NOT NULL DEFAULT false,
    "stageValide" BOOLEAN NOT NULL DEFAULT false,
    "memoireRequis" BOOLEAN NOT NULL DEFAULT false,
    "memoireValide" BOOLEAN NOT NULL DEFAULT false,
    "dateDeliberation" TIMESTAMP(3),
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inscriptionId" INTEGER NOT NULL,

    CONSTRAINT "ValidationAcademique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ValidationAcademique_inscriptionId_key" ON "ValidationAcademique"("inscriptionId");

-- CreateIndex
CREATE INDEX "ValidationAcademique_decision_idx" ON "ValidationAcademique"("decision");

-- AddForeignKey
ALTER TABLE "ValidationAcademique" ADD CONSTRAINT "ValidationAcademique_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "InscriptionEtudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
