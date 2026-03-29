import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../lib/theme';

interface Props {
  action: string;
  remaining?: number;
  color: string;
  size?: number;
}

export default function BreathRing({ action, remaining, color, size = 220 }: Props) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.1);

  useEffect(() => {
    const a = action.toLowerCase();
    if (a.includes('in')) {
      scale.value = withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) });
      glowOpacity.value = withTiming(0.5, { duration: 1000 });
    } else if (a.includes('out') || a.includes('exhale')) {
      scale.value = withTiming(0.85, { duration: 1000, easing: Easing.inOut(Easing.ease) });
      glowOpacity.value = withTiming(0.1, { duration: 1000 });
    } else if (a.includes('hold')) {
      glowOpacity.value = withTiming(0.35, { duration: 500 });
    }
  }, [action]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.glow, glowStyle, { width: size + 40, height: size + 40, borderRadius: (size + 40) / 2, backgroundColor: color }]} />
      <Animated.View style={[styles.ring, ringStyle, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
        <Text style={[styles.action, { fontSize: size > 180 ? 22 : 16 }]}>{action}</Text>
        {remaining !== undefined && (
          <Text style={[styles.count, { fontSize: size > 180 ? 40 : 28 }]}>{remaining}</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  ring: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    color: theme.text,
    fontWeight: '700',
    marginBottom: 6,
  },
  count: {
    color: theme.accent2,
    fontWeight: '800',
  },
});
