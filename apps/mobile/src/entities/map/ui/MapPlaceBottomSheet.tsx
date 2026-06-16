import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Linking, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import type { MapPlace } from '../model/map.model';

interface MapPlaceBottomSheetProps {
  place: MapPlace | null;
  isOpen: boolean;
  onClose: () => void;
  bottomInset?: number;
}

export function MapPlaceBottomSheet({
  place,
  isOpen,
  onClose,
  bottomInset = 0,
}: MapPlaceBottomSheetProps) {
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
      snapPoints={['42%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        {place && (
          <>
            <Text style={styles.placeName} numberOfLines={1}>
              {place.place_name}
            </Text>

            <Text style={styles.address} numberOfLines={2}>
              {place.road_address_name || place.address_name}
            </Text>

            {!!place.phone && <Text style={styles.phone}>{place.phone}</Text>}

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
    backgroundColor: '#D8D8D8',
    width: 36,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 80,
    gap: 6,
  },
  placeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1D1D1D',
    marginBottom: 2,
  },
  address: {
    fontSize: 11,
    color: '#717171',
    lineHeight: 16,
  },
  phone: {
    fontSize: 11,
    color: '#717171',
  },
  button: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF7722',
    borderRadius: 12,
    paddingVertical: 13,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
