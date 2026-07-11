import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { ActivityIndicator, Animated, Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = false,
}: ButtonProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bgColors: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.secondary,
    outline: "transparent",
    ghost: "transparent",
    danger: colors.danger,
  };

  const textColors: Record<string, string> = {
    primary: "#FFFFFF",
    secondary: "#FFFFFF",
    outline: colors.primary,
    ghost: colors.primary,
    danger: "#FFFFFF",
  };

  const heights: Record<string, number> = { sm: 36, md: 48, lg: 56 };
  const paddings: Record<string, number> = { sm: 14, md: 20, lg: 28 };
  const fontSizes: Record<string, number> = { sm: 13, md: 15, lg: 16 };

  const shadowStyle = (variant === "primary" || variant === "secondary" || variant === "danger") && !disabled
    ? {
        shadowColor: variant === "danger" ? colors.danger : variant === "secondary" ? colors.secondary : colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      }
    : {};

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { width: "100%" }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          {
            backgroundColor: bgColors[variant],
            borderRadius: colors.radius,
            height: heights[size] ?? 48,
            paddingHorizontal: paddings[size] ?? 20,
            ...shadowStyle,
          },
          variant === "outline" && { borderWidth: 1.5, borderColor: colors.primary },
          (disabled || loading) && { opacity: 0.45 },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColors[variant]} />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, { color: textColors[variant], fontSize: fontSizes[size] ?? 15, marginLeft: icon ? 8 : 0 }]}>
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
});
