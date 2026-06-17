import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  rounded?: boolean;
};

export function SkeletonCard({ width = '100%', height = 160, rounded = true }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height,
        opacity,
        backgroundColor: '#E4E4E4',
        borderRadius: rounded ? 16 : 0,
      }}
    />
  );
}
