import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useRef } from 'react';
import type { MapPlace } from '../model/map.model';

interface MapPlaceBottomSheetProps {
  place: MapPlace | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MapPlaceBottomSheet({ place, isOpen, onClose }: MapPlaceBottomSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  const openKakaoMap = () => {
    if (!place) return;
    const url =
      place.place_url ||
      `https://map.kakao.com/link/map/${encodeURIComponent(place.place_name)},${place.y},${place.x}`;
    Linking.openURL(url);
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['32%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        {place && (
          <>
            <Text style={styles.placeName}>{place.place_name}</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주소</Text>
              <Text style={styles.infoText}>{place.road_address_name || place.address_name}</Text>
            </View>

            {!!place.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>전화</Text>
                <Text style={styles.infoText}>{place.phone}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={openKakaoMap} activeOpacity={0.8}>
              <Text style={styles.buttonText}>카카오맵으로 이동</Text>
            </TouchableOpacity>
          </>
        )}
      </BottomSheetView>
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 10,
  },
  placeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    width: 28,
    paddingTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  button: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 13,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
