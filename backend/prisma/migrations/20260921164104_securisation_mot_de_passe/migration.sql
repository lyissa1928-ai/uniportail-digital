-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "dateChangementMotDePasse" TIMESTAMP(3),
ADD COLUMN     "doitChangerMotDePasse" BOOLEAN NOT NULL DEFAULT false;
