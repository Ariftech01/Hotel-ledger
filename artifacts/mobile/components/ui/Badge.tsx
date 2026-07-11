import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface BadgeProps {
  label: string;
  variant?: "success" | "danger" | "warning" | "info" | "neutral" | "income" | "expense";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({ label, variant = "neutral", size = "sm", dot = false }: BadgeProps) {
  const colors = useColors();

  const bgMap: Record<string, string> = {
    success: colors.successLight,
    danger: colors.dangerLight,
    warning: colors.warningLight,
    info: colors.accent,
    neutral: colors.muted,
    income: colors.incomeLight,
    expense: colors.expenseLight,
  };

  const textMap: Record<string, string> = {
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    info: colors.primary,
    neutral: colors.mutedForeground,
    income: colors.income,
    expense: colors.expense,
  };

  const dotColor = textMap[variant] ?? colors.mutedForeground;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgMap[variant],
          borderRadius: 100,
          paddingHorizontal: size === "sm" ? 8 : 12,
          paddingVertical: size === "sm" ? 3 : 5,
        },
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.label, { color: textMap[variant], fontSize: size === "sm" ? 11 : 12 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  label: { fontFamily: "Inter_600SemiBold" },
});
