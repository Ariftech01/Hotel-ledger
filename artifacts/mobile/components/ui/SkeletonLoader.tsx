import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, borderRadius, style }: SkeletonProps) {
  const colors = useColors();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animValue]);

  const opacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius: borderRadius ?? colors.radius, backgroundColor: colors.shimmer, opacity }, style]}
    />
  );
}

export function TransactionSkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.txSkeleton, { backgroundColor: colors.card, borderRadius: colors.radius, borderBottomColor: colors.border }]}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </View>
      <View style={{ alignItems: "flex-end", gap: 8 }}>
        <Skeleton width={80} height={14} />
        <Skeleton width={50} height={12} />
      </View>
    </View>
  );
}

export function StatCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.statSkeleton, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <Skeleton width="60%" height={12} />
      <Skeleton width="80%" height={24} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  txSkeleton: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  statSkeleton: { padding: 16, flex: 1, minHeight: 80 },
});
