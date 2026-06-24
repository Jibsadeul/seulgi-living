import { create } from 'zustand';

type RescueStore = {
  selectedIds: Set<string>;
  customIngredients: string[];
  toggleIngredient: (id: string) => void;
  selectIngredient: (id: string) => void;
  addCustomIngredient: (name: string) => void;
  removeCustomIngredient: (name: string) => void;
  clearAll: () => void;
};

export const useRescueStore = create<RescueStore>((set) => ({
  selectedIds: new Set<string>(),
  customIngredients: [],

  toggleIngredient: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  selectIngredient: (id) =>
    set((state) => {
      if (state.selectedIds.has(id)) return state;
      const next = new Set(state.selectedIds);
      next.add(id);
      return { selectedIds: next };
    }),

  addCustomIngredient: (name) =>
    set((state) => {
      if (state.customIngredients.includes(name)) return state;
      return { customIngredients: [...state.customIngredients, name] };
    }),

  removeCustomIngredient: (name) =>
    set((state) => ({
      customIngredients: state.customIngredients.filter((n) => n !== name),
    })),

  clearAll: () => set({ selectedIds: new Set<string>(), customIngredients: [] }),
}));
