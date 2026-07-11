import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCategories } from "@/context/CategoryContext";
import type { Category, TransactionType } from "@/types";

export const OTHERS_CATEGORY: Category = {
  id: "cat_other",
  name: "Others",
  icon: "plus-circle",
  color: "#6B7280",
  type: "both",
};

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (cat: Category) => void;
  selectedId?: string;
  transactionType: TransactionType;
}

export function CategoryPickerModal({
  visible,
  onClose,
  onSelect,
  selectedId,
  transactionType,
}: CategoryPickerModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories, recentCategoryIds } = useCategories();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "recent">("all");

  const typeFiltered = useMemo(
    () => categories.filter((c) => c.type === transactionType || c.type === "both"),
    [categories, transactionType]
  );

  const searched = useMemo(() => {
    if (!search.trim()) return typeFiltered;
    const q = search.toLowerCase();
    return typeFiltered.filter((c) => c.name.toLowerCase().includes(q));
  }, [typeFiltered, search]);

  const recentCats = useMemo(
    () => recentCategoryIds.map((id) => typeFiltered.find((c) => c.id === id)).filter(Boolean) as Category[],
    [recentCategoryIds, typeFiltered]
  );

  const baseList = tab === "recent" ? recentCats : searched;
  const showOthers = tab === "all" && !("others".includes(search.toLowerCase()) === false && search.trim().length > 0);
  const displayList: Category[] = showOthers ? [...baseList, OTHERS_CATEGORY] : baseList;

  const handleSelect = (cat: Category) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    onSelect(cat);
    onClose();
  };

  const renderItem = ({ item }: { item: Category }) => {
    const isSelected = item.id === selectedId;
    return (
      <Pressable
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [
          styles.item,
          {
            backgroundColor: isSelected ? item.color + "15" : pressed ? colors.muted : "transparent",
            borderRadius: 14,
            borderColor: isSelected ? item.color : "transparent",
            borderWidth: isSelected ? 1.5 : 0,
          },
        ]}
      >
        <View style={[styles.catIcon, { backgroundColor: item.color + "18", borderRadius: 12 }]}>
          <Feather name={item.icon as any} size={20} color={item.color} />
        </View>
        <Text style={[styles.catName, { color: isSelected ? item.color : colors.text, fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
          {item.name}
        </Text>
        {isSelected && <Feather name="check-circle" size={18} color={item.color} />}
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            paddingBottom: Math.max(insets.bottom + 16, 24),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 24,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Select Category</Text>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted, borderRadius: 20 }]}>
            <Feather name="x" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 14 }]}>
          <Feather name="search" size={16} color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search categories…"
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
            autoFocus
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={14} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Tabs */}
        {recentCats.length > 0 && (
          <View style={[styles.tabs, { backgroundColor: colors.background, borderRadius: 12 }]}>
            {(["all", "recent"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tab, { backgroundColor: tab === t ? colors.card : "transparent", borderRadius: 10 }]}
              >
                <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground, fontFamily: tab === t ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                  {t === "all" ? "All" : "Recent"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <FlatList
          data={displayList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 8 }}
          numColumns={2}
          columnWrapperStyle={{ gap: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={32} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {search ? `No categories found for "${search}"` : "No categories available"}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, maxHeight: "85%" },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sheetTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  closeBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 46, borderWidth: 1, marginBottom: 14 },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  tabs: { flexDirection: "row", padding: 4, marginBottom: 14 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8 },
  tabText: { fontSize: 14 },
  item: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  catIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  catName: { flex: 1, fontSize: 13, lineHeight: 18 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 12 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
});
