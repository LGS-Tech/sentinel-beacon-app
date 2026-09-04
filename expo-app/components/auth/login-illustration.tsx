import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/** Lightweight stylized recreation of the "stay informed, stay safe" hero scene. */
export function LoginIllustration() {
  return (
    <View style={styles.stage}>
      <Cloud style={{ top: 10, left: 30 }} delay={0} />
      <Cloud style={{ top: 34, left: 160 }} delay={400} />

      <View style={styles.buildingsRow}>
        <Building height={100} windows={6} />
        <Building height={130} windows={8} />
        <Building height={90} windows={5} />
      </View>

      <View style={styles.groundLine} />

      <View style={styles.pathDashRow}>
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={i} style={styles.dash} />
        ))}
      </View>

      <View style={styles.figuresRow}>
        <Walker delay={0} />
        <Walker delay={180} withBag />
        <Walker delay={340} />
      </View>

      <ExitSign />
    </View>
  );
}

function Cloud({ style, delay }: { style: any; delay: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(8, { duration: 2600 }),
          withTiming(0, { duration: 2600 }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, drift]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value }],
  }));

  return (
    <Animated.View style={[styles.cloud, style, animatedStyle]}>
      <Ionicons name="cloud" size={30} color="#D9DDE3" />
    </Animated.View>
  );
}

function Building({ height, windows }: { height: number; windows: number }) {
  return (
    <View style={[styles.building, { height }]}>
      <View style={styles.buildingGrid}>
        {Array.from({ length: windows }).map((_, i) => (
          <View key={i} style={styles.window} />
        ))}
      </View>
    </View>
  );
}

function Walker({ delay, withBag }: { delay: number; withBag?: boolean }) {
  const bob = useSharedValue(0);
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(delay, withTiming(1, { duration: 420 }));
    bob.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 420 }),
          withTiming(0, { duration: 420 }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, enter, bob]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: bob.value },
      { translateX: (1 - enter.value) * -14 },
    ],
  }));

  return (
    <Animated.View style={[styles.walker, animatedStyle]}>
      <MaterialCommunityIcons name="walk" size={34} color="#3A3F47" />
      {withBag ? <View style={styles.bag} /> : null}
    </Animated.View>
  );
}

function ExitSign() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.6, { duration: 900 }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.exitWrap}>
      <View style={styles.exitPost} />
      <Animated.View style={[styles.exitBox, style]}>
        <Text style={styles.exitText}>EXIT</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    height: 260,
    justifyContent: 'flex-end',
  },
  cloud: {
    position: 'absolute',
  },
  buildingsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    marginBottom: 6,
    paddingLeft: 6,
  },
  building: {
    width: 74,
    borderWidth: 1.5,
    borderColor: '#D6D9DE',
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    padding: 6,
    backgroundColor: '#FAFBFC',
  },
  buildingGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    alignContent: 'flex-start',
  },
  window: {
    width: 10,
    height: 10,
    backgroundColor: '#E3E6EA',
    borderRadius: 2,
  },
  groundLine: {
    height: 2,
    backgroundColor: '#D6D9DE',
    width: '100%',
  },
  pathDashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  dash: {
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#E5A6A9',
  },
  figuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  walker: {
    alignItems: 'center',
  },
  bag: {
    position: 'absolute',
    top: 4,
    right: -2,
    width: 8,
    height: 12,
    backgroundColor: '#D71920',
    borderRadius: 3,
  },
  exitWrap: {
    position: 'absolute',
    right: 6,
    bottom: 46,
    alignItems: 'center',
  },
  exitPost: {
    width: 3,
    height: 34,
    backgroundColor: '#C9CDD3',
  },
  exitBox: {
    backgroundColor: '#D71920',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: -2,
  },
  exitText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
