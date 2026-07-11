import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconRing, { borderColor: colors.border }]}>
        <View style={[styles.iconInner, { backgroundColor: colors.muted, borderRadius: 24 }]}>
          <Feather name={icon as any} size={32} color={colors.textTertiary} />
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="outline" style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 56, paddingHorizontal: 32 },
  iconRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  iconInner: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 18, textAlign: "center", marginBottom: 8 },
  description: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22, maxWidth: 280 },
});
