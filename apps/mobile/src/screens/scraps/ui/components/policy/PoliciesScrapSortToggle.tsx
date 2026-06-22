import { useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PolicyScrapSortBy } from '@/entities/policies';

const OPTIONS: { value: PolicyScrapSortBy; label: string }[] = [
  { value: 'deadline', label: '마감임박순' },
  { value: 'recent', label: '최근 스크랩순' },
];

type Props = {
  value: PolicyScrapSortBy;
  onChange: (sortBy: PolicyScrapSortBy) => void;
};

// 디자인 확정 전 임시 UI — Figma(node 365:1263)에 정렬 토글이 없어 직접 만든 드롭다운 (scraps-ui.spec.md §3)
// FlatList 헤더 안에 absolute로 띄우면 뒤에 그려지는 리스트 아이템에 가려져서, Modal로 별도 레이어에 띄운다.
export function PoliciesScrapSortToggle({ value, onChange }: Props) {
  const triggerRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });
  const currentLabel = OPTIONS.find((option) => option.value === value)?.label;

  function openDropdown() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y + height + 4, right: 16 });
      setIsOpen(true);
    });
  }

  function handleSelect(nextValue: PolicyScrapSortBy) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <View>
      <Pressable
        ref={triggerRef}
        onPress={openDropdown}
        className="flex-row items-center"
        style={{ gap: 4 }}
      >
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#a5a5a5' }}>{currentLabel}</Text>
        <Ionicons name="chevron-down" size={12} color="#a5a5a5" />
      </Pressable>

      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable className="flex-1" onPress={() => setIsOpen(false)}>
          <View
            className="absolute bg-surface-default rounded-xl border border-gray-30"
            style={{
              top: anchor.top,
              right: anchor.right,
              minWidth: 130,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            {OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={{ paddingHorizontal: 14, paddingVertical: 10 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: option.value === value ? '700' : '500',
                    color: option.value === value ? '#EF7722' : '#1B1C1A',
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
