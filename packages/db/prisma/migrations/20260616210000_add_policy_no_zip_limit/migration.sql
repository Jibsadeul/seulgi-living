-- AlterTable
ALTER TABLE "policies" ADD COLUMN "no_zip_limit" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "policies" ALTER COLUMN "zip_cd" TYPE TEXT;
