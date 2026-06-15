import * as Location from 'expo-location';
import { useCallback, useRef } from 'react';
import Toast from 'react-native-toast-message';
import type WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { CATEGORY_LIST } from './map.model';
import type { CategoryLabel, RNToWebViewMessage, WebViewToRNMessage } from './map.model';
import { useMapStore } from './map.store';

export function useMap() {
  const webViewRef = useRef<WebView>(null);
  const { setSelectedCategory, setSelectedPlace, selectedCategory } = useMapStore();

  const sendToMap = useCallback((message: RNToWebViewMessage) => {
    // injectJavaScript는 iOS에서 마지막 표현식이 falsy면 오류 발생 → `; true;` 필수
    // webView.postMessage()는 WebView→RN 방향이라 RN→WebView엔 injectJavaScript 사용
    const js = `window.handleRNMessage(${JSON.stringify(message)}); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, []);

  const moveToCurrentLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    sendToMap({
      type: 'MOVE_TO_LOCATION',
      payload: { lat: location.coords.latitude, lng: location.coords.longitude },
    });
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
        case 'MAP_ERROR':
          Toast.show({
            type: 'error',
            text1: '지도를 불러오지 못했어요.',
            text2: '네트워크를 확인해주세요.',
          });
          break;
      }
    },
    [moveToCurrentLocation, setSelectedPlace],
  );

  const selectCategory = useCallback(
    (label: CategoryLabel) => {
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
    [selectedCategory, setSelectedCategory, sendToMap],
  );

  return { webViewRef, onWebViewMessage, moveToCurrentLocation, selectCategory };
}
