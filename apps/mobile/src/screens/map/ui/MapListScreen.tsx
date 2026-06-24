import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  KakaoMapView,
  MapCategoryFilter,
  MapLocationButton,
  MapPlaceBottomSheet,
  MapResultBottomSheet,
  MapSearchBar,
  useMap,
  useMapStore,
} from '@/entities/map';
import { TAB_BAR_BASE_HEIGHT } from '@/shared/ui';

export function MapListScreen() {
  const insets = useSafeAreaInsets();
  const locationButtonOffset = TAB_BAR_BASE_HEIGHT + insets.bottom + 16;
  const {
    webViewRef,
    onWebViewMessage,
    moveToCurrentLocation,
    isLocating,
    selectCategory,
    searchKeyword,
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

        <MapCategoryFilter selected={selectedCategory} onSelect={selectCategory} />

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
      />

      <MapPlaceBottomSheet
        place={selectedPlace}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />

      <Toast />
    </View>
  );
}
