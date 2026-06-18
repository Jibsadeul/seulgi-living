ALTER TABLE "recipe_step" RENAME TO "recipe_steps";

ALTER TABLE "recipe_steps" RENAME CONSTRAINT "recipe_step_pkey" TO "recipe_steps_pkey";

ALTER INDEX "recipe_step_recipe_id_step_number_key" RENAME TO "recipe_steps_recipe_id_step_number_key";

ALTER TABLE "recipe_steps" RENAME CONSTRAINT "recipe_step_recipe_id_fkey" TO "recipe_steps_recipe_id_fkey";

ALTER TYPE "ingredient_category" RENAME VALUE 'ETC' TO 'OTHER';

ALTER TYPE "ingredient_category" RENAME TO "fridge_ingredient_category";
