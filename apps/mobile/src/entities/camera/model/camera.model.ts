export const CAMERA_CAPTURE_MODES = ['receipt', 'ingredient'] as const;

export type CameraCaptureMode = (typeof CAMERA_CAPTURE_MODES)[number];

export type CameraCaptureOption = {
  mode: CameraCaptureMode;
  label: string;
};

export const CAMERA_CAPTURE_OPTIONS = [
  { mode: 'receipt', label: '영수증 촬영' },
  { mode: 'ingredient', label: '식재료 촬영' },
] as const satisfies readonly CameraCaptureOption[];

export const CAMERA_CAPTURE_LABELS: Record<CameraCaptureMode, string> = {
  receipt: '영수증 촬영',
  ingredient: '식재료 촬영',
};

export const isCameraCaptureMode = (value: string | undefined): value is CameraCaptureMode =>
  value === 'receipt' || value === 'ingredient';

export const getCameraCaptureLabel = (mode: CameraCaptureMode) => CAMERA_CAPTURE_LABELS[mode];
