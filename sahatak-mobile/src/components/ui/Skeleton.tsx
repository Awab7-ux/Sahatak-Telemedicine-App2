import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';

/**
 * Smart skeleton primitives.
 * - No shimmer when the OS "reduce motion" accessibility setting is on
 *   (static tint instead).
 * - Loading containers should announce ONCE via `SkeletonList`'s
 *   accessibilityLabel, not per skeleton block (blocks are not accessible).
 * Never leave a skeleton showing indefinitely: callers must render a friendly
 * error + retry when loading fails.
 */

function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        if (mounted) setReduce(Boolean(v));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  return reduce;
}

function useShimmer(reduceMotion: boolean): Animated.Value {
  const opacity = new Animated.Value(reduceMotion ? 1 : 0.55);
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, opacity]);
  return opacity;
}

interface BlockProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

const SkeletonBlockBase: React.FC<BlockProps> = ({ width, height = 14, radius = 8, style }) => {
  const reduceMotion = useReduceMotion();
  const opacity = useShimmer(reduceMotion);
  return (
    <Animated.View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.block,
        {
          width: width ?? '100%',
          height,
          borderRadius: radius,
          opacity: reduceMotion ? 0.55 : opacity,
        },
        style,
      ]}
    />
  );
};

/** A single skeleton line (default height of a text line). */
export const SkeletonLine: React.FC<BlockProps> = (props) => (
  <SkeletonBlockBase height={14} radius={7} {...props} />
);

/** A generic rectangular skeleton block. */
export const SkeletonBlock: React.FC<BlockProps> = (props) => <SkeletonBlockBase {...props} />;

/** A card-shaped skeleton approximating the final card's footprint. */
export const SkeletonCard: React.FC<{
  height?: number;
  style?: ViewStyle;
  showAvatar?: boolean;
}> = ({ height = 120, style, showAvatar = false }) => {
  const reduceMotion = useReduceMotion();
  const opacity = useShimmer(reduceMotion);
  return (
    <Animated.View
      pointerEvents="none"
      accessible={false}
      style={[
        styles.card,
        { height, opacity: reduceMotion ? 0.55 : opacity },
        style,
      ]}
    >
      {showAvatar && <View style={styles.avatar} />}
      <View style={styles.cardBody}>
        <View style={styles.line} />
        <View style={[styles.line, { width: '60%' }]} />
      </View>
    </Animated.View>
  );
};

/**
 * Wraps a list of skeletons in ONE screen-reader announcement so assistive
 * tech hears "loading" once, not once per block.
 */
export const SkeletonList: React.FC<{
  count?: number;
  cardHeight?: number;
  label?: string;
}> = ({ count = 3, cardHeight = 120, label }) => (
  <View
    accessible
    accessibilityRole="text"
    accessibilityLiveRegion="polite"
    accessibilityLabel={label ?? 'Loading'}
    style={styles.list}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} height={cardHeight} showAvatar />
    ))}
  </View>
);

const styles = StyleSheet.create({
  block: {
    backgroundColor: Colors.slate[200],
  },
  card: {
    backgroundColor: Colors.slate[100],
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.slate[200],
  },
  cardBody: {
    flex: 1,
    gap: 10,
  },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.slate[200],
    width: '85%',
  },
  list: {
    gap: 12,
  },
});
