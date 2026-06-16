-- CreateEnum
CREATE TYPE "recipe_source" AS ENUM ('PUBLIC', 'USER');

-- CreateEnum
CREATE TYPE "cooking_method" AS ENUM ('GRILL', 'BOIL', 'STIR_FRY', 'STEAM', 'FRY', 'BRAISE', 'PAN_FRY', 'OTHER');

-- CreateEnum
CREATE TYPE "recipe_category" AS ENUM ('SOUP_STEW', 'SIDE_DISH', 'RICE_PORRIDGE', 'DESSERT', 'OTHER');

-- CreateEnum
CREATE TYPE "ingredient_category" AS ENUM ('VEGETABLE', 'FRUIT', 'MEAT', 'SEAFOOD', 'EGG_DAIRY', 'GRAIN_NOODLE', 'PROCESSED', 'SAUCE_SEASONING', 'ETC');

-- CreateTable
CREATE TABLE "sido" (
    "id" VARCHAR(2) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "sido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sigungu" (
    "id" VARCHAR(5) NOT NULL,
    "sido_id" VARCHAR(2) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "sigungu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL,
    "kakao_id" VARCHAR(255) NOT NULL,
    "sigungu_id" VARCHAR(5),
    "email" VARCHAR(255),
    "nickname" VARCHAR(100),
    "birthday" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" UUID NOT NULL,
    "source" "recipe_source" NOT NULL,
    "user_id" UUID,
    "public_recipe_id" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "category" "recipe_category" NOT NULL,
    "cooking_method" "cooking_method" NOT NULL,
    "ingredients_raw" TEXT,
    "ingredients" JSONB NOT NULL,
    "main_image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "calories" DOUBLE PRECISION,
    "carbohydrate" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "sodium_tip" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_step" (
    "id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "step_number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "recipe_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_scraps" (
    "recipe_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "folder_id" UUID,

    CONSTRAINT "recipe_scraps_pkey" PRIMARY KEY ("recipe_id","user_id")
);

-- CreateTable
CREATE TABLE "fridge_ingredients" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "image_key" VARCHAR(50) NOT NULL DEFAULT 'DEFAULT',
    "quantity" INTEGER NOT NULL,
    "unit" VARCHAR(10) NOT NULL,
    "category" "ingredient_category" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fridge_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grocery_purchase_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "quantity_text" VARCHAR(20),
    "price" INTEGER NOT NULL,
    "purchased_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grocery_purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_scrap_folders" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "folder_name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_scrap_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_scraps" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "policy_id" VARCHAR(255) NOT NULL,
    "policy_scrap_folder_id" BIGINT,
    "policy_name" VARCHAR(100) NOT NULL,
    "support_type" VARCHAR(100),
    "apply_start_date" DATE,
    "apply_end_date" DATE,
    "notification_sent" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6),

    CONSTRAINT "policy_scraps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipe_step_recipe_id_step_number_key" ON "recipe_step"("recipe_id", "step_number");

-- AddForeignKey
ALTER TABLE "sigungu" ADD CONSTRAINT "sigungu_sido_id_fkey" FOREIGN KEY ("sido_id") REFERENCES "sido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_sigungu_id_fkey" FOREIGN KEY ("sigungu_id") REFERENCES "sigungu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_step" ADD CONSTRAINT "recipe_step_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_scraps" ADD CONSTRAINT "recipe_scraps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_scraps" ADD CONSTRAINT "recipe_scraps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fridge_ingredients" ADD CONSTRAINT "fridge_ingredients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grocery_purchase_items" ADD CONSTRAINT "grocery_purchase_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_scrap_folders" ADD CONSTRAINT "policy_scrap_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_scraps" ADD CONSTRAINT "policy_scraps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_scraps" ADD CONSTRAINT "policy_scraps_policy_scrap_folder_id_fkey" FOREIGN KEY ("policy_scrap_folder_id") REFERENCES "policy_scrap_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
