import { create } from 'zustand';
import type { CategoryLabel, MapPlace } from './map.model';

interface MapState {
  selectedCategory: CategoryLabel | null;
  selectedPlace: MapPlace | null;
  isBottomSheetOpen: boolean;
  setSelectedCategory: (label: CategoryLabel | null) => void;
  setSelectedPlace: (place: MapPlace) => void;
  clearSelectedPlace: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedCategory: null,
  selectedPlace: null,
  isBottomSheetOpen: false,
  setSelectedCategory: (label) => set({ selectedCategory: label }),
  setSelectedPlace: (place) => set({ selectedPlace: place, isBottomSheetOpen: true }),
  clearSelectedPlace: () => set({ selectedPlace: null, isBottomSheetOpen: false }),
}));
