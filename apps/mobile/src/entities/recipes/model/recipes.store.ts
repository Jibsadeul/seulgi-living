import { create } from 'zustand';
import type { CookingMethod, RecipeCategory } from '../api/recipes.schema';

export type MyRecipeStep = {
  description: string;
  imageUri: string;
};

export type MyRecipeItem = {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  cookingMethod: CookingMethod;
  category: RecipeCategory;
  ingredients: string;
  steps: MyRecipeStep[];
  sodiumTip: string;
  createdAt: number;
};

type MyRecipeStore = {
  recipes: MyRecipeItem[];
  addRecipe: (recipe: Omit<MyRecipeItem, 'id' | 'createdAt'>) => void;
  updateRecipe: (id: string, recipe: Omit<MyRecipeItem, 'id' | 'createdAt'>) => void;
  deleteRecipe: (id: string) => void;
  getRecipeById: (id: string) => MyRecipeItem | undefined;
};

export const useMyRecipeStore = create<MyRecipeStore>((set, get) => ({
  recipes: [],

  addRecipe: (recipe) =>
    set((state) => ({
      recipes: [
        { ...recipe, id: Date.now().toString(), createdAt: Date.now() },
        ...state.recipes,
      ],
    })),

  updateRecipe: (id, recipe) =>
    set((state) => ({
      recipes: state.recipes.map((r) =>
        r.id === id ? { ...r, ...recipe } : r,
      ),
    })),

  deleteRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id !== id),
    })),

  getRecipeById: (id) => get().recipes.find((r) => r.id === id),
}));
