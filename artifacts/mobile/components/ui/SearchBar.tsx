import { Feather } from "@expo/vector-icons";
import React from "react";
import { Animated, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
}

export function SearchBar({ value, onChangeText, placeholder = "Search transactions…", onFilterPress, showFilter }: SearchBarProps) {
  const colors = useColors();

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          },
        ]}
      >
        <Feather name="search" size={17} color={colors.textTertiary} style={{ marginRight: 10 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { color: colors.text }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText("")}
            style={[styles.clearBtn, { backgroundColor: colors.muted, borderRadius: 10 }]}
            hitSlop={8}
          >
            <Feather name="x" size={12} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>
      {showFilter && (
        <Pressable
          onPress={onFilterPress}
          style={({ pressed }) => [
            styles.filterBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: 14,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="sliders" size={18} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  container: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 48, borderWidth: 1 },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  clearBtn: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  filterBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1 },
});
