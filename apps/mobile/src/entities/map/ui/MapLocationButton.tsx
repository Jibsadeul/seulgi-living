import { ActivityIndicator, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

interface MapLocationButtonProps {
  onPress: () => void;
  bottomOffset: number;
  isLoading?: boolean;
}

export function MapLocationButton({ onPress, bottomOffset, isLoading }: MapLocationButtonProps) {
  return (
    <TouchableOpacity
      className="absolute right-4 w-11 h-11 rounded-full bg-white items-center justify-center shadow z-10"
      style={{ bottom: bottomOffset }}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#EF7722" />
      ) : (
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
      )}
    </TouchableOpacity>
  );
}
