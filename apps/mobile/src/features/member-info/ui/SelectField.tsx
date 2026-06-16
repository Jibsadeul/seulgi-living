import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

export type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function SelectField({
  label,
  placeholder,
  value,
  options,
  disabled = false,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  const close = () => setIsOpen(false);

  return (
    <View className="flex-1">
      <Text className="mb-2 text-xs font-semibold text-gray-70">{label}</Text>
      <Pressable
        className={`h-12 justify-center rounded-lg border px-3 ${
          disabled ? 'border-gray-20 bg-gray-10' : 'border-gray-30 bg-white'
        }`}
        disabled={disabled}
        onPress={() => setIsOpen(true)}
      >
        <Text className={selectedLabel ? 'text-sm text-gray-90' : 'text-sm text-gray-40'}>
          {selectedLabel ?? placeholder}
        </Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
        <Pressable className="flex-1 justify-center bg-black/35 px-6" onPress={close}>
          <Pressable
            className="max-h-[420px] rounded-xl bg-white p-3"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="px-2 py-3 text-base font-bold text-gray-90">{label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  className={`min-h-11 justify-center rounded-lg px-3 ${
                    option.value === value ? 'bg-main-10' : 'bg-white'
                  }`}
                  onPress={() => {
                    onChange(option.value);
                    close();
                  }}
                >
                  <Text className="text-sm text-gray-90">{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
