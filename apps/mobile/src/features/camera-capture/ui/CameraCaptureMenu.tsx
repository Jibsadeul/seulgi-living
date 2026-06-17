import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CAMERA_CAPTURE_OPTIONS, type CameraCaptureMode } from '@/entities/camera';
import CameraIcon from '../../../../assets/icons/Camera.svg';

type CameraCaptureMenuProps = {
  bottomOffset: number;
};

type ImageSource = 'camera' | 'library';
type MenuStep = 'mode' | 'source';

export function CameraCaptureMenu({ bottomOffset }: CameraCaptureMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [menuStep, setMenuStep] = useState<MenuStep>('mode');
  const [selectedMode, setSelectedMode] = useState<CameraCaptureMode | null>(null);

  const openMenu = () => {
    setMenuStep('mode');
    setSelectedMode(null);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setMenuStep('mode');
    setSelectedMode(null);
    setIsOpen(false);
  };

  const openResult = (mode: CameraCaptureMode, imageUri: string) => {
    router.push({
      pathname: '/(stack)/camera',
      params: { mode, imageUri },
    });
  };

  const pickImage = async (mode: CameraCaptureMode, source: ImageSource) => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        source === 'camera' ? '카메라 권한 필요' : '앨범 권한 필요',
        source === 'camera'
          ? '촬영을 위해 카메라 권한을 허용해주세요.'
          : '이미지 선택을 위해 사진 접근 권한을 허용해주세요.',
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
          });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset) {
      return;
    }

    openResult(mode, asset.uri);
  };

  const handleSelect = (mode: CameraCaptureMode) => {
    setSelectedMode(mode);
    setMenuStep('source');
  };

  const handleSourceSelect = (source: ImageSource) => {
    if (!selectedMode) {
      closeMenu();
      return;
    }

    closeMenu();
    void pickImage(selectedMode, source);
  };

  return (
    <>
      <View style={styles.anchor} pointerEvents="box-none">
        <Pressable
          className="w-16 h-16 rounded-full bg-main-100 items-center justify-center"
          style={styles.button}
          onPress={openMenu}
        >
          <CameraIcon width={28} height={28} />
        </Pressable>
      </View>

      <Modal transparent visible={isOpen} animationType="fade" onRequestClose={closeMenu}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeMenu} />
          <View style={[styles.menuWrap, { bottom: bottomOffset + 12 }]}>
            <View style={styles.menu}>
              {menuStep === 'mode' ? (
                CAMERA_CAPTURE_OPTIONS.map((option, index) => (
                  <Pressable
                    key={option.mode}
                    onPress={() => handleSelect(option.mode)}
                    style={[styles.menuItem, index > 0 && styles.menuItemBorder]}
                  >
                    <Text style={styles.menuItemText}>{option.label}</Text>
                  </Pressable>
                ))
              ) : (
                <>
                  <Pressable style={styles.menuItem} onPress={() => setMenuStep('mode')}>
                    <Text style={styles.backText}>이전으로</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleSourceSelect('camera')}
                    style={[styles.menuItem, styles.menuItemBorder]}
                  >
                    <Text style={styles.menuItemText}>촬영</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleSourceSelect('library')}
                    style={[styles.menuItem, styles.menuItemBorder]}
                  >
                    <Text style={styles.menuItemText}>앨범 선택</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    elevation: 6,
    shadowColor: '#EF7722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  menuWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menu: {
    minWidth: 168,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuItemBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8E8E8',
  },
  menuItemText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
    fontWeight: '500',
    textAlign: 'center',
  },
  backText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});
