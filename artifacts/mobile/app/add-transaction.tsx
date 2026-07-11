import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
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
import { useTransactions } from "@/context/TransactionContext";
import { useHotel } from "@/context/HotelContext";
import { useCategories } from "@/context/CategoryContext";
import { CategoryPickerModal, OTHERS_CATEGORY } from "@/components/ui/CategoryPickerModal";
import type { Category, PaymentMethod, TransactionType } from "@/types";
import { Button } from "@/components/ui/Button";
import { getTodayString, PAYMENT_METHOD_LABELS } from "@/utils/format";

const PAYMENT_METHODS: PaymentMethod[] = [
  "cash", "upi", "gpay", "phonepe", "paytm", "bhim",
  "bank_transfer", "cheque", "credit_card", "debit_card",
];

const PM_ICONS: Record<string, string> = {
  cash: "dollar-sign", upi: "zap", gpay: "smartphone", phonepe: "smartphone",
  paytm: "smartphone", bhim: "smartphone", bank_transfer: "briefcase",
  cheque: "file-text", credit_card: "credit-card", debit_card: "credit-card",
};

export default function AddTransactionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTransaction } = useTransactions();
  const { selectedHotel, hotels } = useHotel();
  const { markRecentCategory } = useCategories();

  const [type, setType] = useState<TransactionType>("credit");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [remarks, setRemarks] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  const isCredit = type === "credit";
  const accentColor = isCredit ? colors.income : colors.expense;

  const switchType = (t: TransactionType) => {
    setType(t);
    setSelectedCategory(null);
    setCustomCategoryName("");
    if (Platform.OS !== "web") Haptics.selectionAsync();
  };

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    markRecentCategory(cat.id);
    setErrors((e) => ({ ...e, category: "" }));
  };

  const isOthers = selectedCategory?.id === OTHERS_CATEGORY.id;

  const validate = () => {
    const e: Record<string, string> = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) e.amount = "Enter a valid amount greater than 0";
    if (!selectedCategory) e.category = "Please select a category";
    if (isOthers && !customCategoryName.trim()) e.customCategory = "Please enter a category name";
    if (!remarks.trim()) e.remarks = "Remarks are required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const resolvedCategory = isOthers && customCategoryName.trim()
    ? { ...OTHERS_CATEGORY, name: customCategoryName.trim() }
    : selectedCategory;

  const handleSave = async () => {
    if (!validate()) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    try {
      const now = new Date();
      addTransaction({
        type,
        amount: parseFloat(amount),
        categoryId: resolvedCategory!.id,
        category: resolvedCategory!,
        paymentMethod,
        hotelId: selectedHotel?.id ?? hotels[0]?.id ?? "h1",
        hotel: selectedHotel ?? hotels[0],
        remarks: remarks.trim(),
        description: description.trim() || undefined,
        date,
        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        attachmentUrl: undefined,
      });
      setSaved(true);
      setTimeout(() => router.back(), 700);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: colors.muted, borderRadius: 10 }]}>
          <Feather name="x" size={18} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Transaction</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Income / Expense Toggle */}
      <View style={[styles.typeBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.typeToggle, { backgroundColor: colors.background, borderRadius: 14 }]}>
          {(["credit", "debit"] as TransactionType[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => switchType(t)}
              style={[
                styles.typeBtn,
                {
                  flex: 1, borderRadius: 12,
                  backgroundColor: type === t ? (t === "credit" ? colors.income : colors.expense) : "transparent",
                },
              ]}
            >
              <Feather
                name={t === "credit" ? "arrow-up-circle" : "arrow-down-circle"}
                size={17}
                color={type === t ? "#FFFFFF" : colors.mutedForeground}
              />
              <Text style={[styles.typeBtnText, { color: type === t ? "#FFFFFF" : colors.mutedForeground, fontFamily: type === t ? "Inter_700Bold" : "Inter_400Regular" }]}>
                {t === "credit" ? "Income" : "Expense"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Amount */}
          <View style={styles.amountSection}>
            <Text style={[styles.amountHint, { color: colors.mutedForeground }]}>Enter amount</Text>
            <View style={styles.amountRow}>
              <Text style={[styles.rupee, { color: errors.amount ? colors.danger : accentColor }]}>₹</Text>
              <TextInput
                value={amount}
                onChangeText={(t) => { setAmount(t.replace(/[^0-9.]/g, "")); setErrors((e) => ({ ...e, amount: "" })); }}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                style={[styles.amountInput, { color: errors.amount ? colors.danger : colors.text }]}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
            <View style={[styles.amountLine, { backgroundColor: errors.amount ? colors.danger : accentColor }]} />
            {errors.amount ? <Text style={[styles.errText, { color: colors.danger }]}>{errors.amount}</Text> : null}
          </View>

          {/* Category Picker */}
          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category <Text style={{ color: colors.danger }}>*</Text></Text>
              {errors.category ? <Text style={[styles.errText, { color: colors.danger }]}>{errors.category}</Text> : null}
            </View>
            <Pressable
              onPress={() => setCatModalVisible(true)}
              style={({ pressed }) => [
                styles.catPickerBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.category ? colors.danger : selectedCategory ? selectedCategory.color : colors.border,
                  borderRadius: 14,
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: selectedCategory ? selectedCategory.color : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: selectedCategory ? 3 : 0,
                },
              ]}
            >
              {selectedCategory ? (
                <>
                  <View style={[styles.catPickerIcon, { backgroundColor: selectedCategory.color + "18", borderRadius: 10 }]}>
                    <Feather name={selectedCategory.icon as any} size={20} color={selectedCategory.color} />
                  </View>
                  <Text style={[styles.catPickerName, { color: selectedCategory.color }]}>{selectedCategory.name}</Text>
                  <Feather name="chevron-right" size={16} color={selectedCategory.color} />
                </>
              ) : (
                <>
                  <View style={[styles.catPickerIcon, { backgroundColor: colors.muted, borderRadius: 10 }]}>
                    <Feather name="grid" size={20} color={colors.textTertiary} />
                  </View>
                  <Text style={[styles.catPickerPlaceholder, { color: colors.textTertiary }]}>Tap to select category…</Text>
                  <Feather name="chevron-right" size={16} color={colors.textTertiary} />
                </>
              )}
            </Pressable>

            {/* Custom name input when "Others" is selected */}
            {isOthers && (
              <View style={{ marginTop: 12 }}>
                <View style={[styles.inputWrap, {
                  backgroundColor: colors.card,
                  borderColor: errors.customCategory ? colors.danger : colors.border,
                  borderRadius: 14,
                }]}>
                  <Feather name="edit-3" size={15} color={colors.textTertiary} />
                  <TextInput
                    value={customCategoryName}
                    onChangeText={(t) => { setCustomCategoryName(t); setErrors((e) => ({ ...e, customCategory: "" })); }}
                    placeholder="Enter custom category name…"
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.inputField, { color: colors.text }]}
                    autoFocus
                  />
                </View>
                {errors.customCategory ? (
                  <Text style={[styles.errText, { color: colors.danger }]}>{errors.customCategory}</Text>
                ) : null}
              </View>
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {PAYMENT_METHODS.map((pm) => {
                const sel = paymentMethod === pm;
                return (
                  <Pressable
                    key={pm}
                    onPress={() => setPaymentMethod(pm)}
                    style={[
                      styles.pmChip,
                      {
                        backgroundColor: sel ? colors.primary : colors.card,
                        borderColor: sel ? colors.primary : colors.border,
                        borderRadius: 100,
                        shadowColor: sel ? colors.primary : "transparent",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: sel ? 2 : 0,
                      },
                    ]}
                  >
                    <Feather name={(PM_ICONS[pm] ?? "dollar-sign") as any} size={13} color={sel ? "#FFFFFF" : colors.mutedForeground} />
                    <Text style={[styles.pmLabel, { color: sel ? "#FFFFFF" : colors.textSecondary }]}>{PAYMENT_METHOD_LABELS[pm]}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Remarks */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Remarks <Text style={{ color: colors.danger }}>*</Text></Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: errors.remarks ? colors.danger : colors.border, borderRadius: 14 }]}>
              <Feather name="edit-3" size={15} color={colors.textTertiary} />
              <TextInput
                value={remarks}
                onChangeText={(t) => { setRemarks(t); setErrors((e) => ({ ...e, remarks: "" })); }}
                placeholder="Brief description of this transaction"
                placeholderTextColor={colors.textTertiary}
                style={[styles.inputField, { color: colors.text }]}
              />
            </View>
            {errors.remarks ? <Text style={[styles.errText, { color: colors.danger }]}>{errors.remarks}</Text> : null}
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notes <Text style={{ color: colors.textTertiary }}>(optional)</Text></Text>
            <View style={[styles.textareaWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Additional notes…"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textarea, { color: colors.text }]}
                multiline
                textAlignVertical="top"
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Date */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Date</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}>
              <Feather name="calendar" size={15} color={colors.textTertiary} />
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                style={[styles.inputField, { color: colors.text }]}
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button label="Cancel" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
            <Button
              label={saved ? "Saved ✓" : "Save Transaction"}
              onPress={handleSave}
              loading={loading}
              disabled={saved}
              style={{ flex: 2 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CategoryPickerModal
        visible={catModalVisible}
        onClose={() => setCatModalVisible(false)}
        onSelect={handleCategorySelect}
        selectedId={selectedCategory?.id}
        transactionType={type}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  typeBar: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  typeToggle: { flexDirection: "row", padding: 4, gap: 4 },
  typeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  typeBtnText: { fontSize: 15 },
  scroll: { padding: 20, paddingBottom: 60 },
  amountSection: { alignItems: "center", paddingVertical: 24, marginBottom: 8 },
  amountHint: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 12 },
  amountRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  rupee: { fontFamily: "Inter_700Bold", fontSize: 32, paddingBottom: 6 },
  amountInput: { fontFamily: "Inter_700Bold", fontSize: 52, minWidth: 120, textAlign: "center" },
  amountLine: { height: 2, borderRadius: 1, width: 200, marginTop: 8 },
  field: { marginBottom: 24 },
  fieldLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 14, marginBottom: 12 },
  catPickerBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1.5 },
  catPickerIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  catPickerName: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  catPickerPlaceholder: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  pmChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5 },
  pmLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 52, borderWidth: 1.5 },
  inputField: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  textareaWrap: { paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, minHeight: 88 },
  textarea: { fontFamily: "Inter_400Regular", fontSize: 15, flex: 1 },
  errText: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginTop: 16, paddingBottom: 40 },
});
