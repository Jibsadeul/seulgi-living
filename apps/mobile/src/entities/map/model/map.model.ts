export const CATEGORY_LIST = [
  { label: '병원', code: 'HP8', keyword: null },
  { label: '약국', code: 'PM9', keyword: null },
  { label: '편의점', code: 'CS2', keyword: null },
  { label: '마트', code: 'MT1', keyword: null },
  { label: '식당', code: 'FD6', keyword: null },
  // 카카오 카테고리에 코인빨래방 없음 → keyword 검색으로 대체. code가 null이면 searchCategory에서 keywordSearch 분기
  { label: '빨래방', code: null, keyword: '셀프빨래방' },
  { label: '주민센터', code: 'PO3', keyword: null },
] as const;

export type CategoryLabel = (typeof CATEGORY_LIST)[number]['label'];

export interface MapPlace {
  place_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  x: string; // 카카오 API는 경도(longitude)를 string으로 반환
  y: string; // 카카오 API는 위도(latitude)를 string으로 반환. LatLng(y, x) 순서 주의
  distance?: string; // location+radius 검색 시 미터 단위 문자열 (예: "250")
}

export type RNToWebViewMessage =
  | { type: 'SEARCH_CATEGORY'; payload: { code: string | null; keyword: string | null } }
  | { type: 'SEARCH_KEYWORD'; payload: { keyword: string } }
  | { type: 'FOCUS_MARKER'; payload: { x: string; y: string } }
  | { type: 'CLEAR_MARKERS' }
  | { type: 'MOVE_TO_LOCATION'; payload: { lat: number; lng: number } };

export type WebViewToRNMessage =
  | { type: 'MAP_READY' }
  | { type: 'MARKER_CLICK'; payload: MapPlace }
  | { type: 'SEARCH_RESULT'; payload: { places: MapPlace[] } }
  | { type: 'SEARCH_ZERO_RESULT'; payload: { keyword: string } }
  | { type: 'MAP_ERROR'; payload: { message: string } };
