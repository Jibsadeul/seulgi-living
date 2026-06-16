import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MapPlace } from '../model/map.model';

interface MapResultBottomSheetProps {
  places: MapPlace[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace: (place: MapPlace) => void;
}

function formatDistance(distance?: string): string {
  if (!distance) return '';
  const meters = parseInt(distance, 10);
  if (isNaN(meters)) return '';
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${meters}m`;
}

export function MapResultBottomSheet({
  places,
  isOpen,
  onClose,
  onSelectPlace,
}: MapResultBottomSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['30%', '60%'], []);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.listContent}>
        {places.map((item, index) => (
          <View key={item.id}>
            <Pressable
              style={styles.item}
              onPress={() => onSelectPlace(item)}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <View style={styles.itemMain}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {item.place_name}
                </Text>
                {!!formatDistance(item.distance) && (
                  <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
                )}
              </View>
              <Text style={styles.address} numberOfLines={1}>
                {item.road_address_name || item.address_name}
              </Text>
            </Pressable>
            {index < places.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#fff',
  },
  handle: {
    backgroundColor: '#ddd',
    width: 36,
  },
  listContent: {
    paddingBottom: 32,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  placeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  distance: {
    fontSize: 13,
    fontWeight: '500',
    color: '#EF7722',
  },
  address: {
    fontSize: 13,
    color: '#888',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
});
