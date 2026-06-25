import { pickImageUri, type ImagePickSource } from '@/shared/lib/image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type FabMenuStep = 'mode' | 'source';

const FAB_SIZE = 64;
const MENU_GAP = 16;

function FabActionButton({
  label,
  iconName,
  onPress,
}: {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-end gap-3">
      <View
        className="rounded-lg bg-surface-default px-3.5 py-2"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text className="text-sm font-semibold text-gray-70">{label}</Text>
      </View>
      <Pressable
        className="h-12 w-12 items-center justify-center rounded-full bg-surface-default"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
        onPress={onPress}
      >
        <Ionicons name={iconName} size={22} color="#EF7722" />
      </Pressable>
    </View>
  );
}

export function GroceryInputFab({
  fabBottomOffset,
  onDirectInputPress,
}: {
  fabBottomOffset: number;
  onDirectInputPress: () => void;
}) {
  const router = useRouter();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [fabMenuStep, setFabMenuStep] = useState<FabMenuStep>('mode');

  const openFabMenu = () => {
    setFabMenuStep('mode');
    setIsFabOpen(true);
  };

  const closeFabMenu = () => {
    setFabMenuStep('mode');
    setIsFabOpen(false);
  };

  const handleReceiptCapture = () => {
    setFabMenuStep('source');
  };

  const handleReceiptSourceSelect = async (source: ImagePickSource) => {
    closeFabMenu();
    const imageUri = await pickImageUri(source);
    if (!imageUri) return;
    router.push({ pathname: '/(stack)/camera', params: { mode: 'receipt', imageUri } });
  };

  const handleDirectInput = () => {
    closeFabMenu();
    onDirectInputPress();
  };

  return (
    <>
      {isFabOpen && (
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <Pressable className="flex-1" onPress={closeFabMenu} />
          <View
            className="absolute right-6 gap-4"
            style={{ bottom: fabBottomOffset + FAB_SIZE + MENU_GAP }}
          >
            {fabMenuStep === 'mode' ? (
              <>
                <FabActionButton
                  label="영수증 등록"
                  iconName="camera-outline"
                  onPress={handleReceiptCapture}
                />
                <FabActionButton
                  label="직접 입력"
                  iconName="create-outline"
                  onPress={handleDirectInput}
                />
              </>
            ) : (
              <>
                <FabActionButton
                  label="촬영"
                  iconName="camera-outline"
                  onPress={() => {
                    void handleReceiptSourceSelect('camera');
                  }}
                />
                <FabActionButton
                  label="앨범 선택"
                  iconName="images-outline"
                  onPress={() => {
                    void handleReceiptSourceSelect('library');
                  }}
                />
              </>
            )}
          </View>
        </View>
      )}

      <Pressable
        accessibilityLabel={
          isFabOpen && fabMenuStep === 'source'
            ? '이전 옵션으로 돌아가기'
            : isFabOpen
              ? '장보기 추가 메뉴 닫기'
              : '장보기 내역 추가'
        }
        className="absolute right-6 h-16 w-16 items-center justify-center rounded-full bg-main-100"
        style={{
          bottom: fabBottomOffset,
          shadowColor: '#EF7722',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.24,
          shadowRadius: 12,
          elevation: 8,
        }}
        onPress={() => {
          if (!isFabOpen) {
            openFabMenu();
            return;
          }
          if (fabMenuStep === 'source') {
            setFabMenuStep('mode');
            return;
          }
          closeFabMenu();
        }}
      >
        <Ionicons
          name={
            isFabOpen && fabMenuStep === 'source' ? 'chevron-back' : isFabOpen ? 'close' : 'add'
          }
          size={24}
          color="#FFFFFF"
        />
        {!isFabOpen && <Text className="text-[10px] font-semibold text-white">추가</Text>}
      </Pressable>
    </>
  );
}
