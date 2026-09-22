-- AlterTable
ALTER TABLE "SeanceCours" ADD COLUMN     "motifRejet" TEXT,
ADD COLUMN     "rejeteeLe" TIMESTAMP(3),
ADD COLUMN     "valideeLe" TIMESTAMP(3);
