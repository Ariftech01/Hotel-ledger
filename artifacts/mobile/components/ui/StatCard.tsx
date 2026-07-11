import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatCompactCurrency } from "@/utils/format";

interface StatCardProps {
  label: string;
  amount: number;
  icon: string;
  iconColor?: string;
  iconBg?: string;
  trend?: number;
  style?: ViewStyle;
  size?: "sm" | "md" | "lg";
  accentColor?: string;
  sublabel?: string;
}

export function StatCard({ label, amount, icon, iconColor, iconBg, trend, style, size = "md", accentColor, sublabel }: StatCardProps) {
  const colors = useColors();
  const isLarge = size === "lg";

  const ic = iconColor ?? colors.primary;
  const ibg = iconBg ?? (ic + "18");

  const isAccent = !!accentColor;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: accentColor ?? colors.card,
          borderRadius: 16,
          padding: isLarge ? 20 : 16,
          flex: 1,
          borderWidth: isAccent ? 0 : 1,
          borderColor: colors.border,
          shadowColor: accentColor ?? "#000",
          shadowOffset: { width: 0, height: isAccent ? 8 : 2 },
          shadowOpacity: isAccent ? 0.3 : 0.06,
          shadowRadius: isAccent ? 16 : 6,
          elevation: isAccent ? 6 : 2,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: isAccent ? "rgba(255,255,255,0.18)" : ibg, borderRadius: 10 }]}>
          <Feather name={icon as any} size={18} color={isAccent ? "#FFFFFF" : ic} />
        </View>
        {trend !== undefined && (
          <View style={[styles.trendPill, { backgroundColor: trend >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }]}>
            <Feather name={trend >= 0 ? "arrow-up-right" : "arrow-down-right"} size={10} color={trend >= 0 ? "#10B981" : "#EF4444"} />
            <Text style={[styles.trendText, { color: trend >= 0 ? "#10B981" : "#EF4444" }]}>
              {Math.abs(trend).toFixed(0)}%
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.label, { color: isAccent ? "rgba(255,255,255,0.75)" : colors.mutedForeground, marginTop: 14 }]}>
        {label}
      </Text>
      <Text style={[styles.amount, { color: isAccent ? "#FFFFFF" : colors.text, fontSize: isLarge ? 26 : 20 }]}>
        {formatCompactCurrency(amount)}
      </Text>
      {sublabel && (
        <Text style={[styles.sublabel, { color: isAccent ? "rgba(255,255,255,0.6)" : colors.textTertiary }]}>
          {sublabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  iconWrap: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  trendPill: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 100 },
  trendText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  label: { fontFamily: "Inter_500Medium", fontSize: 12, marginBottom: 4 },
  amount: { fontFamily: "Inter_700Bold" },
  sublabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 3 },
});
