import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

const native = Platform.OS !== 'web';

export function WeatherEntrance({ children, delay, reduced }: {
  children: ReactNode;
  delay: number;
  reduced: boolean;
}) {
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    progress.setValue(reduced ? 1 : 0);
    if (reduced) return;
    const animation = Animated.timing(progress, {
      toValue: 1, delay, duration: 350, useNativeDriver: native, isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, progress, reduced]);

  return (
    <Animated.View style={{
      opacity: progress,
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
    }}>
      {children}
    </Animated.View>
  );
}

export function WeatherMotion({ children, reduced, code, isDay }: {
  children: ReactNode;
  reduced: boolean;
  code: number;
  isDay: boolean;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const snow = [71, 73, 75, 77, 85, 86].includes(code);
  const rain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);

  useEffect(() => {
    progress.setValue(0);
    if (reduced) return;
    const timing = (toValue: number) => Animated.timing(progress, {
      toValue, duration: 1350, useNativeDriver: native, isInteraction: false,
    });
    const animation = Animated.loop(Animated.sequence([timing(1), timing(0)]));
    animation.start();
    return () => animation.stop();
  }, [progress, reduced]);

  return (
    <View className="h-28 w-full items-center justify-center" pointerEvents="none">
      {(rain || snow || !isDay) && (
        <Animated.View style={[StyleSheet.absoluteFill, {
          opacity: reduced ? 0.65 : progress.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] }),
          transform: [{ translateY: reduced ? 0 : progress.interpolate({
            inputRange: [0, 1], outputRange: [0, rain || snow ? 13 : 0],
          }) }],
        }]}>
          {Array.from({ length: 12 }, (_, index) => (
            <View key={index} style={{
              position: 'absolute',
              left: `${index < 6 ? 3 + index * 5 : 70 + (index - 6) * 5}%`,
              top: 8 + (index * 29) % 70,
              width: rain ? 2 : 3 + index % 3,
              height: rain ? 11 : 3 + index % 3,
              borderRadius: 4,
              backgroundColor: rain ? '#bae6fd' : '#fff',
              transform: [{ rotate: rain ? '20deg' : '0deg' }],
            }} />
          ))}
        </Animated.View>
      )}
      <Animated.View style={{
        transform: [{ translateY: reduced ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
      }}>
        {children}
      </Animated.View>
    </View>
  );
}
