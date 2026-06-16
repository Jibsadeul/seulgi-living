import { TouchableOpacity } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

interface MapLocationButtonProps {
  onPress: () => void;
}

export function MapLocationButton({ onPress }: MapLocationButtonProps) {
  return (
    <TouchableOpacity
      className="absolute right-4 bottom-6 w-11 h-11 rounded-full bg-white items-center justify-center shadow z-10"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="4" stroke="#EF7722" strokeWidth="2" />
        <Circle cx="12" cy="12" r="9" stroke="#EF7722" strokeWidth="1.5" />
        <Line
          x1="12"
          y1="1"
          x2="12"
          y2="5"
          stroke="#EF7722"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Line
          x1="12"
          y1="19"
          x2="12"
          y2="23"
          stroke="#EF7722"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Line
          x1="1"
          y1="12"
          x2="5"
          y2="12"
          stroke="#EF7722"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Line
          x1="19"
          y1="12"
          x2="23"
          y2="12"
          stroke="#EF7722"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    </TouchableOpacity>
  );
}
