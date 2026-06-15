import { StyleSheet, View } from 'react-native';
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

export function MapListScreen() {
  const insets = useSafeAreaInsets();
  const {
    webViewRef,
    onWebViewMessage,
    moveToCurrentLocation,
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MapSearchBar
        onSearch={searchKeyword}
        onClear={clearSearchResults}
        isZeroResult={isZeroResult}
      />

      <View style={styles.mapWrapper}>
        <KakaoMapView webViewRef={webViewRef} onMessage={onWebViewMessage} />

        <MapCategoryFilter selected={selectedCategory} onSelect={selectCategory} />

        <MapLocationButton onPress={moveToCurrentLocation} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
});
