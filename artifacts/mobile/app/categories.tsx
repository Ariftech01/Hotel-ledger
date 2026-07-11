import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCategories } from "@/context/CategoryContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS } from "@/services/mockData";
import type { Category } from "@/types";

type TypeFilter = "all" | "income" | "expense";

interface AddEditModal {
  visible: boolean;
  editing: Category | null;
}

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [modal, setModal] = useState<AddEditModal>({ visible: false, editing: null });

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"income" | "expense">("income");
  const [formIcon, setFormIcon] = useState("home");
  const [formColor, setFormColor] = useState("#059669");
  const [formError, setFormError] = useState("");

  const topPad = insets.top + 16;

  const openAdd = () => {
    setFormName(""); setFormType("income"); setFormIcon("home"); setFormColor("#059669"); setFormError("");
    setModal({ visible: true, editing: null });
  };

  const openEdit = (cat: Category) => {
    setFormName(cat.name); setFormType(cat.type === "both" ? "income" : cat.type);
    setFormIcon(cat.icon); setFormColor(cat.color); setFormError("");
    setModal({ visible: true, editing: cat });
  };

  const closeModal = () => setModal({ visible: false, editing: null });

  const handleSave = () => {
    if (!formName.trim()) { setFormError("Category name is required"); return; }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (modal.editing) {
      updateCategory(modal.editing.id, { name: formName.trim(), type: formType, icon: formIcon, color: formColor });
    } else {
      addCategory({ name: formName.trim(), type: formType, icon: formIcon, color: formColor });
    }
    closeModal();
  };

  const handleDelete = (cat: Category) => {
    if (Platform.OS === "web") { deleteCategory(cat.id); return; }
    Alert.alert("Delete Category", `Delete "${cat.name}"? Existing transactions won't be affected.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteCategory(cat.id); if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
    ]);
  };

  const filtered = categories.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.type === typeFilter || c.type === "both";
    return matchSearch && matchType;
  });

  const incomeCats = filtered.filter((c) => c.type === "income" || c.type === "both");
  const expenseCats = filtered.filter((c) => c.type === "expense" || c.type === "both");

  const TypeTab = ({ label, value }: { label: string; value: TypeFilter }) => {
    const active = typeFilter === value;
    return (
      <Pressable
        onPress={() => setTypeFilter(value)}
        style={[styles.typeTab, { borderBottomColor: active ? colors.primary : "transparent", borderBottomWidth: 2 }]}
      >
        <Text style={[styles.typeTabText, { color: active ? colors.primary : colors.mutedForeground, fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" }]}>
          {label}
        </Text>
        <View style={[styles.typeTabCount, { backgroundColor: active ? colors.accent : colors.muted }]}>
          <Text style={[styles.typeTabCountText, { color: active ? colors.primary : colors.mutedForeground }]}>
            {value === "all" ? filtered.length : value === "income" ? incomeCats.length : expenseCats.length}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <Pressable
      onPress={() => openEdit(item)}
      style={({ pressed }) => [
        styles.catRow,
        { backgroundColor: pressed ? colors.muted : colors.card, borderBottomColor: colors.border },
      ]}
    >
      <View style={[styles.catIcon, { backgroundColor: item.color + "18", borderRadius: 12 }]}>
        <Feather name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.catName, { color: colors.text }]}>{item.name}</Text>
        <Badge
          label={item.type === "income" ? "Income" : item.type === "expense" ? "Expense" : "Both"}
          variant={item.type === "income" ? "income" : item.type === "expense" ? "expense" : "neutral"}
          size="sm"
        />
      </View>
      <View style={styles.catActions}>
        <Pressable onPress={() => openEdit(item)} style={[styles.actionBtn, { backgroundColor: colors.accent, borderRadius: 9 }]}>
          <Feather name="edit-2" size={14} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => handleDelete(item)} style={[styles.actionBtn, { backgroundColor: colors.dangerLight, borderRadius: 9 }]}>
          <Feather name="trash-2" size={14} color={colors.danger} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted, borderRadius: 10 }]}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{categories.length} total</Text>
        </View>
        <Pressable onPress={openAdd} style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: 12 }]}>
          <Feather name="plus" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchWrap, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 14 }]}>
          <Feather name="search" size={16} color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search categories…"
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={14} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Type Tabs */}
      <View style={[styles.typeTabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TypeTab label="All" value="all" />
        <TypeTab label="Income" value="income" />
        <TypeTab label="Expense" value="expense" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="grid"
            title="No Categories Found"
            description={search ? `No results for "${search}"` : "Add your first category to get started."}
            actionLabel="Add Category"
            onAction={openAdd}
          />
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={modal.visible} animationType="slide" transparent onRequestClose={closeModal}>
        <Pressable style={styles.overlay} onPress={closeModal} />
        <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom + 20, 32) }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {modal.editing ? "Edit Category" : "New Category"}
            </Text>
            <Pressable onPress={closeModal} style={[styles.closeBtn, { backgroundColor: colors.muted, borderRadius: 20 }]}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category Name *</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: formError ? colors.danger : colors.border, borderRadius: 14 }]}>
              <Feather name="tag" size={16} color={colors.textTertiary} />
              <TextInput
                value={formName}
                onChangeText={(t) => { setFormName(t); setFormError(""); }}
                placeholder="e.g. Room Rent, Electricity"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, { color: colors.text }]}
                autoFocus
              />
            </View>
            {formError ? <Text style={[styles.errText, { color: colors.danger }]}>{formError}</Text> : null}

            {/* Type */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>Type</Text>
            <View style={styles.typeToggle}>
              {(["income", "expense"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setFormType(t)}
                  style={[
                    styles.typeBtn,
                    {
                      flex: 1,
                      borderRadius: 12,
                      backgroundColor: formType === t
                        ? (t === "income" ? colors.income : colors.expense)
                        : colors.background,
                    },
                  ]}
                >
                  <Feather
                    name={t === "income" ? "arrow-up-circle" : "arrow-down-circle"}
                    size={16}
                    color={formType === t ? "#FFFFFF" : colors.mutedForeground}
                  />
                  <Text style={[styles.typeBtnText, { color: formType === t ? "#FFFFFF" : colors.mutedForeground }]}>
                    {t === "income" ? "Income" : "Expense"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Icon */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {CATEGORY_ICON_OPTIONS.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setFormIcon(icon)}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: formIcon === icon ? formColor + "22" : colors.background,
                      borderColor: formIcon === icon ? formColor : colors.border,
                      borderRadius: 10,
                    },
                  ]}
                >
                  <Feather name={icon as any} size={20} color={formIcon === icon ? formColor : colors.textTertiary} />
                </Pressable>
              ))}
            </ScrollView>

            {/* Color */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>Color</Text>
            <View style={styles.colorGrid}>
              {CATEGORY_COLOR_OPTIONS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setFormColor(color)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color, borderRadius: 10 },
                    formColor === color && { borderWidth: 3, borderColor: "#FFFFFF", shadowColor: color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 },
                  ]}
                >
                  {formColor === color && <Feather name="check" size={14} color="#FFFFFF" />}
                </Pressable>
              ))}
            </View>

            {/* Preview */}
            <View style={[styles.preview, { backgroundColor: colors.background, borderRadius: 14 }]}>
              <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>Preview</Text>
              <View style={styles.previewRow}>
                <View style={[styles.previewIcon, { backgroundColor: formColor + "18", borderRadius: 12 }]}>
                  <Feather name={formIcon as any} size={22} color={formColor} />
                </View>
                <Text style={[styles.previewName, { color: colors.text }]}>{formName || "Category Name"}</Text>
                <View style={[styles.previewPill, { backgroundColor: formType === "income" ? colors.incomeLight : colors.expenseLight }]}>
                  <Text style={[styles.previewPillText, { color: formType === "income" ? colors.income : colors.expense }]}>
                    {formType === "income" ? "Income" : "Expense"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button label="Cancel" onPress={closeModal} variant="outline" style={{ flex: 1 }} />
              <Button label={modal.editing ? "Save Changes" : "Add Category"} onPress={handleSave} style={{ flex: 2 }} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, marginLeft: "auto" },
  addBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#FFFFFF" },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 46, borderWidth: 1 },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  typeTabs: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  typeTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 13 },
  typeTabText: { fontSize: 14 },
  typeTabCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  typeTabCountText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  catRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  catIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  catName: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 6 },
  catActions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, maxHeight: "92%", shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 24 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sheetTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  closeBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 10 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 52, borderWidth: 1.5 },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  errText: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  typeToggle: { flexDirection: "row", gap: 8 },
  typeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13 },
  typeBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  iconOption: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorOption: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  preview: { padding: 16, marginTop: 20, marginBottom: 8 },
  previewLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginBottom: 12 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  previewIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  previewName: { fontFamily: "Inter_600SemiBold", fontSize: 15, flex: 1 },
  previewPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  previewPillText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 8 },
});
