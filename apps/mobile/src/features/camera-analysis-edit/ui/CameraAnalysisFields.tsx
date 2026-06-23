import { Text, TextInput, View } from 'react-native';

export function FieldLabel({ children }: { children: string }) {
  return <Text className="mb-1.5 ml-1 text-xs font-semibold text-gray-60">{children}</Text>;
}

export function FormInput({
  editable = true,
  value,
  placeholder,
  keyboardType,
  onChangeText,
  errorMessage,
}: {
  editable?: boolean;
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  onChangeText: (value: string) => void;
  errorMessage?: string;
}) {
  return (
    <View>
      <TextInput
        className={`min-h-11 rounded-[10px] px-3 text-base font-medium ${
          editable ? 'bg-gray-5 text-gray-90' : 'border border-gray-20 bg-gray-10 text-gray-50'
        } ${errorMessage ? 'border border-point-100' : ''}`}
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8E8E8E"
        value={value}
      />
      {errorMessage ? (
        <Text className="mt-1 ml-1 text-xs font-medium text-point-100">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
