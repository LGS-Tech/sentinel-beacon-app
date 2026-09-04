import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const EXIT_DURATION = 260;

/**
 * Fades + lifts the current auth screen out before swapping routes, so moving
 * between Login and Sign Up reads as one smooth transition instead of a hard cut.
 */
export function usePageTransition() {
  const router = useRouter();
  const progress = useSharedValue(1);

  const pageStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.985 + progress.value * 0.015 },
      { translateY: (1 - progress.value) * -14 },
    ],
  }));

  const navigate = useCallback(
    (path: '/login' | '/registerPage') => {
      progress.value = withTiming(0, {
        duration: EXIT_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      setTimeout(() => router.replace(path), EXIT_DURATION);
    },
    [progress, router],
  );

  return { pageStyle, navigate };
}
