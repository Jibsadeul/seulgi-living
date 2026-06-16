/*
  Warnings:

  - You are about to drop the column `apply_end_date` on the `policy_scraps` table. All the data in the column will be lost.
  - You are about to drop the column `apply_start_date` on the `policy_scraps` table. All the data in the column will be lost.
  - You are about to drop the column `policy_name` on the `policy_scraps` table. All the data in the column will be lost.
  - You are about to drop the column `policy_scrap_folder_id` on the `policy_scraps` table. All the data in the column will be lost.
  - You are about to drop the column `support_type` on the `policy_scraps` table. All the data in the column will be lost.
  - You are about to alter the column `policy_id` on the `policy_scraps` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.
  - You are about to drop the `policy_scrap_folders` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `created_at` on table `policy_scraps` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "policy_scrap_folders" DROP CONSTRAINT "policy_scrap_folders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "policy_scraps" DROP CONSTRAINT "policy_scraps_policy_scrap_folder_id_fkey";

-- AlterTable
ALTER TABLE "policy_scraps" DROP COLUMN "apply_end_date",
DROP COLUMN "apply_start_date",
DROP COLUMN "policy_name",
DROP COLUMN "policy_scrap_folder_id",
DROP COLUMN "support_type",
ALTER COLUMN "policy_id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "notification_sent" SET DEFAULT false,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "policy_scrap_folders";

-- CreateTable
CREATE TABLE "policies" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "keywords" VARCHAR(500),
    "large_category" VARCHAR(100),
    "medium_category" VARCHAR(100),
    "age_min" INTEGER,
    "age_max" INTEGER,
    "no_age_limit" BOOLEAN NOT NULL DEFAULT false,
    "apply_start_date" DATE,
    "apply_end_date" DATE,
    "apply_period_type" VARCHAR(20),
    "apply_period_text" VARCHAR(100),
    "application_url" TEXT,
    "zip_cd" VARCHAR(500),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "synced_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "policy_scraps" ADD CONSTRAINT "policy_scraps_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
