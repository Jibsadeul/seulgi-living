import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { MapPlace } from '../model/map.model';

interface MapResultBottomSheetProps {
  places: MapPlace[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace: (place: MapPlace) => void;
  bottomInset?: number;
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
  bottomInset = 0,
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
      bottomInset={bottomInset}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#fff',
      }}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: 36 }}
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {places.map((item, index) => (
          <View key={item.id}>
            <Pressable
              className="px-5 py-3.5"
              onPress={() => onSelectPlace(item)}
              android_ripple={{ color: '#f0f0f0' }}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className="flex-1 text-base font-semibold text-gray-90 mr-2"
                  numberOfLines={1}
                >
                  {item.place_name}
                </Text>
                {!!formatDistance(item.distance) && (
                  <Text className="text-sm font-medium text-main-100">
                    {formatDistance(item.distance)}
                  </Text>
                )}
              </View>
              <Text className="text-sm text-gray-50" numberOfLines={1}>
                {item.road_address_name || item.address_name}
              </Text>
            </Pressable>
            {index < places.length - 1 && <View className="h-px bg-gray-10 mx-5" />}
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
