import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import Toast from 'react-native-toast-message';
import { getKakaoMapHtml } from './kakaoMapHtml';

const KAKAO_MAP_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_KEY ?? '';
const MAP_HTML = getKakaoMapHtml(KAKAO_MAP_KEY);

const showNetworkError = () =>
  Toast.show({
    type: 'error',
    text1: '지도를 불러오지 못했어요.',
    text2: '네트워크를 확인해주세요.',
  });

interface KakaoMapViewProps {
  webViewRef: React.RefObject<WebView | null>;
  onMessage: (event: WebViewMessageEvent) => void;
}

export function KakaoMapView({ webViewRef, onMessage }: KakaoMapViewProps) {
  return (
    <WebView
      ref={webViewRef}
      style={styles.webview}
      source={{ html: MAP_HTML, baseUrl: 'http://localhost' }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      mixedContentMode="always"
      onMessage={onMessage}
      onError={showNetworkError}
      onHttpError={showNetworkError}
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1 },
});
