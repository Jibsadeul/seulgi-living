export const CATEGORY_LIST = [
  { label: '병원', code: 'HP8', keyword: null },
  { label: '약국', code: 'PM9', keyword: null },
  { label: '편의점', code: 'CS2', keyword: null },
  { label: '마트', code: 'MT1', keyword: null },
  { label: '식당', code: 'FD6', keyword: null },
  { label: '빨래방', code: null, keyword: '코인빨래방' },
  { label: '주민센터', code: 'PO3', keyword: null },
] as const;

export type CategoryLabel = (typeof CATEGORY_LIST)[number]['label'];

export interface MapPlace {
  place_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  x: string;
  y: string;
}

export type RNToWebViewMessage =
  | { type: 'SEARCH_CATEGORY'; payload: { code: string | null; keyword: string | null } }
  | { type: 'CLEAR_MARKERS' }
  | { type: 'MOVE_TO_LOCATION'; payload: { lat: number; lng: number } };

export type WebViewToRNMessage =
  | { type: 'MAP_READY' }
  | { type: 'MARKER_CLICK'; payload: MapPlace }
  | { type: 'MAP_ERROR'; payload: { message: string } };
