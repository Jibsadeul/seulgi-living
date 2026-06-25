import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useRef } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { MapPlace } from '../model/map.model';

function getCategoryLabel(categoryName: string): string {
  // category_name은 "음식점 > 한식 > 육류,고기"처럼 전체 경로로 와서, 마지막(가장 구체적인) segment만 보여준다.
  const segments = categoryName.split('>').map((segment) => segment.trim());
  return segments[segments.length - 1] || '';
}

interface MapPlaceBottomSheetProps {
  place: MapPlace | null;
  isOpen: boolean;
  onClose: () => void;
  bottomInset?: number;
  animatedPosition?: SharedValue<number>;
}

export function MapPlaceBottomSheet({
  place,
  isOpen,
  onClose,
  bottomInset = 0,
  animatedPosition,
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
      snapPoints={['40%']}
      bottomInset={bottomInset}
      animatedPosition={animatedPosition}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#fff',
      }}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: 36 }}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 80, gap: 6 }}>
        {place && (
          <View className="gap-1.5">
            <Text className="text-[17px] font-bold text-gray-90" numberOfLines={1}>
              {place.place_name}
            </Text>

            {!!place.category_name && (
              <Text className="text-[11px] font-medium text-main-100" numberOfLines={1}>
                {getCategoryLabel(place.category_name)}
              </Text>
            )}

            <Text className="text-[11px] text-gray-60 leading-4" numberOfLines={2}>
              {place.road_address_name || place.address_name}
            </Text>

            {!!place.phone && <Text className="text-[11px] text-gray-60">{place.phone}</Text>}

            <TouchableOpacity
              className="mt-2.5 items-center justify-center bg-main-100 rounded-xl py-3.5"
              onPress={openKakaoMap}
              activeOpacity={0.8}
            >
              <Text className="text-[15px] font-semibold text-white">카카오맵으로 이동</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}
