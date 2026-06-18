import { create } from 'zustand';
import type { CameraAnalyzeResponse } from './camera.model';

interface CameraStoreState {
  analysisResult: CameraAnalyzeResponse | null;
  setAnalysisResult: (result: CameraAnalyzeResponse) => void;
  clearAnalysisResult: () => void;
}

export const useCameraStore = create<CameraStoreState>((set) => ({
  analysisResult: null,
  setAnalysisResult: (result) => set({ analysisResult: result }),
  clearAnalysisResult: () => set({ analysisResult: null }),
}));
