import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import type WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { CATEGORY_LIST } from './map.model';
import type { CategoryLabel, MapPlace, RNToWebViewMessage, WebViewToRNMessage } from './map.model';
import { useMapStore } from './map.store';

export function useMap() {
  const webViewRef = useRef<WebView>(null);
  const [isLocating, setIsLocating] = useState(false);
  const {
    setSelectedCategory,
    setSelectedPlace,
    selectedCategory,
    setSearchResults,
    setSearchKeyword,
    setZeroResult,
    clearSearch,
  } = useMapStore();

  const sendToMap = useCallback((message: RNToWebViewMessage) => {
    // injectJavaScript는 iOS에서 마지막 표현식이 falsy면 오류 발생 → `; true;` 필수
    // webView.postMessage()는 WebView→RN 방향이라 RN→WebView엔 injectJavaScript 사용
    const js = `window.handleRNMessage(${JSON.stringify(message)}); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, []);

  const moveToCurrentLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'info',
        text1: '위치 권한이 없어요.',
        text2: '설정에서 위치 권한을 허용해주세요.',
      });
      return;
    }

    // GPS 조회(getCurrentPositionAsync)가 수 초씩 걸릴 수 있어, 버튼에 로딩 상태를 노출해
    // "눌렀는데 반응이 없다"는 오인을 막는다.
    setIsLocating(true);
    try {
      // 현재 위치 우선. 실패 시 마지막 알려진 위치로 fallback
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      sendToMap({
        type: 'MOVE_TO_LOCATION',
        payload: { lat: location.coords.latitude, lng: location.coords.longitude },
      });
    } catch {
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        sendToMap({
          type: 'MOVE_TO_LOCATION',
          payload: { lat: last.coords.latitude, lng: last.coords.longitude },
        });
      } else {
        Toast.show({
          type: 'error',
          text1: '현재 위치를 가져올 수 없어요.',
          text2: '잠시 후 다시 시도해주세요.',
        });
      }
    } finally {
      setIsLocating(false);
    }
  }, [sendToMap]);

  const onWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let message: WebViewToRNMessage;
      try {
        message = JSON.parse(event.nativeEvent.data) as WebViewToRNMessage;
      } catch {
        return;
      }

      switch (message.type) {
        case 'MAP_READY':
          // WebView 초기화 완료 후 GPS 요청 → map 객체 생성 전에 MOVE_TO_LOCATION 보내면 무시됨
          moveToCurrentLocation();
          break;
        case 'MARKER_CLICK':
          setSelectedPlace(message.payload);
          break;
        case 'SEARCH_RESULT':
          setSearchResults(message.payload.places);
          break;
        case 'SEARCH_ZERO_RESULT':
          setZeroResult();
          break;
        case 'MAP_ERROR':
          Toast.show({
            type: 'error',
            text1: '지도를 불러오지 못했어요.',
            text2: '네트워크를 확인해주세요.',
          });
          break;
      }
    },
    [moveToCurrentLocation, setSelectedPlace, setSearchResults, setZeroResult],
  );

  const selectCategory = useCallback(
    (label: CategoryLabel) => {
      clearSearch(); // 키워드 검색 상태 초기화

      if (selectedCategory === label) {
        setSelectedCategory(null);
        sendToMap({ type: 'CLEAR_MARKERS' });
        return;
      }

      setSelectedCategory(label);
      const category = CATEGORY_LIST.find((c) => c.label === label);
      if (!category) return;

      sendToMap({
        type: 'SEARCH_CATEGORY',
        payload: { code: category.code ?? null, keyword: category.keyword ?? null },
      });
    },
    [selectedCategory, setSelectedCategory, sendToMap, clearSearch],
  );

  const searchKeyword = useCallback(
    (keyword: string) => {
      setSelectedCategory(null); // 카테고리 선택 해제
      setSearchKeyword(keyword);
      sendToMap({ type: 'SEARCH_KEYWORD', payload: { keyword } });
    },
    [setSelectedCategory, setSearchKeyword, sendToMap],
  );

  const focusMarker = useCallback(
    (place: MapPlace) => {
      setSelectedPlace(place);
      sendToMap({ type: 'FOCUS_MARKER', payload: { x: place.x, y: place.y } });
    },
    [setSelectedPlace, sendToMap],
  );

  const clearSearchResults = useCallback(() => {
    clearSearch();
    sendToMap({ type: 'CLEAR_MARKERS' });
  }, [clearSearch, sendToMap]);

  return {
    webViewRef,
    onWebViewMessage,
    moveToCurrentLocation,
    isLocating,
    selectCategory,
    searchKeyword,
    focusMarker,
    clearSearchResults,
  };
}
