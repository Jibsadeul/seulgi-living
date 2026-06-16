import { create } from 'zustand';
import type { CategoryLabel, MapPlace } from './map.model';

interface MapState {
  selectedCategory: CategoryLabel | null;
  selectedPlace: MapPlace | null;
  searchResults: MapPlace[];
  searchKeyword: string;
  isZeroResult: boolean;
  isDetailOpen: boolean;
  isListOpen: boolean;

  setSelectedCategory: (label: CategoryLabel | null) => void;
  setSelectedPlace: (place: MapPlace) => void;
  clearSelectedPlace: () => void;
  setSearchResults: (places: MapPlace[]) => void;
  setSearchKeyword: (keyword: string) => void;
  setZeroResult: () => void;
  clearSearch: () => void;
  setListOpen: (open: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedCategory: null,
  selectedPlace: null,
  searchResults: [],
  searchKeyword: '',
  isZeroResult: false,
  isDetailOpen: false,
  isListOpen: false,

  setSelectedCategory: (label) => set({ selectedCategory: label }),
  setSelectedPlace: (place) => set({ selectedPlace: place, isDetailOpen: true, isListOpen: false }),
  clearSelectedPlace: () => set({ selectedPlace: null, isDetailOpen: false }),
  setSearchResults: (places) =>
    set({ searchResults: places, isZeroResult: false, isListOpen: places.length > 0 }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword, isZeroResult: false }),
  setZeroResult: () => set({ isZeroResult: true, searchResults: [], isListOpen: false }),
  clearSearch: () =>
    set({ searchResults: [], searchKeyword: '', isZeroResult: false, isListOpen: false }),
  setListOpen: (open) => set({ isListOpen: open }),
}));
