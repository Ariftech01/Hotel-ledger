import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useColors } from "@/hooks/useColors";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}

export function FilterChip({ label, selected, onPress, count }: FilterChipProps) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderRadius: 100,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primary : colors.card,
          opacity: pressed ? 0.85 : 1,
          shadowColor: selected ? colors.primary : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: selected ? 2 : 0,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? "#FFFFFF" : colors.textSecondary, fontFamily: selected ? "Inter_600SemiBold" : "Inter_500Medium" }]}>
        {label}
      </Text>
      {count !== undefined && (
        <Text style={[styles.count, { color: selected ? "rgba(255,255,255,0.75)" : colors.textTertiary }]}>
          {count}
        </Text>
      )}
    </Pressable>
  );
}

interface FilterChipGroupProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export function FilterChipGroup({ options, selected, onSelect }: FilterChipGroupProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((opt) => (
        <FilterChip key={opt} label={opt} selected={selected === opt} onPress={() => onSelect(opt)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 16, paddingVertical: 9, borderWidth: 1, marginRight: 8 },
  label: { fontSize: 13 },
  count: { fontSize: 11, fontFamily: "Inter_500Medium" },
  row: { paddingVertical: 2 },
});
