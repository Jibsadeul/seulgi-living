import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  KakaoMapView,
  MapCategoryFilter,
  MapLocationButton,
  MapPlaceBottomSheet,
  useMap,
  useMapStore,
} from '@/entities/map';

export function MapListScreen() {
  const insets = useSafeAreaInsets();
  const { webViewRef, onWebViewMessage, moveToCurrentLocation, selectCategory } = useMap();
  const { selectedCategory, selectedPlace, isBottomSheetOpen, clearSelectedPlace } = useMapStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.mapWrapper}>
        <KakaoMapView webViewRef={webViewRef} onMessage={onWebViewMessage} />

        <MapCategoryFilter selected={selectedCategory} onSelect={selectCategory} />

        <MapLocationButton onPress={moveToCurrentLocation} />
      </View>

      <MapPlaceBottomSheet
        place={selectedPlace}
        isOpen={isBottomSheetOpen}
        onClose={clearSelectedPlace}
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
