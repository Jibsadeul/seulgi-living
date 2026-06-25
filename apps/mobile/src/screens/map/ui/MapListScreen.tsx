import { useState } from 'react';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import {
  KakaoMapView,
  MapCategoryFilter,
  MapLocationButton,
  MapPlaceBottomSheet,
  MapResearchButton,
  MapResultBottomSheet,
  MapSearchBar,
  useMap,
  useMapStore,
} from '@/entities/map';
import { TAB_BAR_BASE_HEIGHT } from '@/shared/ui';

const windowHeight = Dimensions.get('window').height;

export function MapListScreen() {
  const insets = useSafeAreaInsets();
  const locationButtonBaseOffset = TAB_BAR_BASE_HEIGHT + insets.bottom + 16;
  // 카테고리 칩 영역의 실제 높이를 측정해, 재검색 버튼을 그 바로 아래에 위치시킨다.
  const [categoryFilterBottom, setCategoryFilterBottom] = useState(48);

  // 바텀시트가 올라온 높이만큼 내위치 버튼도 같이 따라 올라가도록, 두 바텀시트의 상단 위치 중 더 높이 올라온 쪽을 기준으로 오프셋을 계산한다.
  const resultSheetPosition = useSharedValue(windowHeight);
  const placeSheetPosition = useSharedValue(windowHeight);
  const locationButtonOffset = useDerivedValue(() => {
    const sheetTop = Math.min(resultSheetPosition.value, placeSheetPosition.value);
    const sheetHeight = Math.max(windowHeight - sheetTop, 0);
    return locationButtonBaseOffset + sheetHeight;
  });

  const {
    webViewRef,
    onWebViewMessage,
    moveToCurrentLocation,
    isLocating,
    isMapMoved,
    selectCategory,
    searchKeyword,
    researchCurrentArea,
    focusMarker,
    clearSearchResults,
  } = useMap();
  const {
    selectedCategory,
    selectedPlace,
    searchResults,
    isZeroResult,
    isDetailOpen,
    isListOpen,
    clearSelectedPlace,
    setListOpen,
  } = useMapStore();

  const handleCloseDetail = () => {
    clearSelectedPlace();
    if (searchResults.length > 0) {
      setListOpen(true);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <MapSearchBar
        onSearch={searchKeyword}
        onClear={clearSearchResults}
        isZeroResult={isZeroResult}
      />

      <View className="flex-1 relative">
        <KakaoMapView webViewRef={webViewRef} onMessage={onWebViewMessage} />

        <MapCategoryFilter
          selected={selectedCategory}
          onSelect={selectCategory}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setCategoryFilterBottom(y + height);
          }}
        />

        <MapResearchButton
          visible={isMapMoved && searchResults.length > 0}
          onPress={researchCurrentArea}
          top={categoryFilterBottom + 20}
        />

        <MapLocationButton
          onPress={moveToCurrentLocation}
          bottomOffset={locationButtonOffset}
          isLoading={isLocating}
        />
      </View>

      <MapResultBottomSheet
        places={searchResults}
        isOpen={isListOpen}
        onClose={() => setListOpen(false)}
        onSelectPlace={focusMarker}
        animatedPosition={resultSheetPosition}
      />

      <MapPlaceBottomSheet
        place={selectedPlace}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        animatedPosition={placeSheetPosition}
      />

      <Toast />
    </View>
  );
}
