import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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
import { useCategories } from "@/context/CategoryContext";
import { CategoryPickerModal, OTHERS_CATEGORY } from "@/components/ui/CategoryPickerModal";
import type { Category, PaymentMethod } from "@/types";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PAYMENT_METHOD_LABELS } from "@/utils/format";

const PAYMENT_METHODS: PaymentMethod[] = [
  "cash", "upi", "gpay", "phonepe", "paytm", "bhim",
  "bank_transfer", "cheque", "credit_card", "debit_card",
];

const PM_ICONS: Record<string, string> = {
  cash: "dollar-sign", upi: "zap", gpay: "smartphone", phonepe: "smartphone",
  paytm: "smartphone", bhim: "smartphone", bank_transfer: "briefcase",
  cheque: "file-text", credit_card: "credit-card", debit_card: "credit-card",
};

export default function EditTransactionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, editTransaction } = useTransactions();
  const { markRecentCategory, addCategory } = useCategories();

  const transaction = transactions.find((t) => t.id === id);

  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(transaction?.category ?? null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction?.paymentMethod ?? "cash");
  const [remarks, setRemarks] = useState(transaction?.remarks ?? "");
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState(
    transaction?.category?.id === "cat_other" ? (transaction.remarks ?? "") : ""
  );

  if (!transaction) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="alert-circle"
          title="Transaction Not Found"
          description="This transaction could not be found."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const txType = transaction.type;
  const accentColor = txType === "credit" ? colors.income : colors.expense;
  const isOthers = selectedCategory?.id === OTHERS_CATEGORY.id;

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    if (cat.id !== OTHERS_CATEGORY.id) markRecentCategory(cat.id);
    setErrors((e) => ({ ...e, category: "", customCategory: "" }));
  };

  const resolvedCategory = isOthers && customCategoryName.trim()
    ? { ...OTHERS_CATEGORY, name: customCategoryName.trim() }
    : selectedCategory;

  const validate = () => {
    const e: Record<string, string> = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) e.amount = "Enter a valid amount greater than 0";
    if (!selectedCategory) e.category = "Please select a category";
    if (isOthers && !customCategoryName.trim()) e.customCategory = "Please enter a category name";
    if (!remarks.trim()) e.remarks = "Remarks are required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    try {
      let finalCategoryId = selectedCategory!.id;
      let finalCategory = selectedCategory!;

      if (isOthers && customCategoryName.trim()) {
        const newCat = await addCategory({
          name: customCategoryName.trim(),
          icon: "grid",
          color: colors.primary,
          type: txType === "credit" ? "income" : "expense",
          hotelId: transaction.hotelId,
        });
        finalCategoryId = newCat.id;
        finalCategory = newCat;
      }

      await editTransaction(id, {
        amount: parseFloat(amount),
        categoryId: finalCategoryId,
        category: finalCategory,
        paymentMethod,
        remarks: remarks.trim(),
        description: description.trim() || undefined,
        editedBy: "Manager",
      });
      router.back();
    } catch (err) {
      console.warn("Failed to edit transaction", err);
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
        <Text style={[styles.title, { color: colors.text }]}>Edit Transaction</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Edit Banner */}
      {transaction.isEdited && (
        <View style={[styles.editedBanner, { backgroundColor: colors.warningLight }]}>
          <Feather name="edit-2" size={14} color={colors.warning} />
          <Text style={[styles.editedText, { color: colors.warning }]}>
            Previously edited on {transaction.editedAt} by {transaction.editedBy}
          </Text>
        </View>
      )}

      {/* Original Values */}
      <View style={[styles.prevCard, { backgroundColor: colors.muted, borderRadius: 14, marginHorizontal: 16, marginTop: 16 }]}>
        <Text style={[styles.prevLabel, { color: colors.mutedForeground }]}>Original Values</Text>
        <Text style={[styles.prevAmount, { color: accentColor }]}>
          {txType === "credit" ? "+" : "−"}₹{transaction.amount.toLocaleString("en-IN")}
          {transaction.category ? ` · ${transaction.category.name}` : ""}
        </Text>
        <Text style={[styles.prevRemarks, { color: colors.textSecondary }]}>{transaction.remarks}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Amount */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
            <View style={[styles.amountWrap, { borderBottomColor: errors.amount ? colors.danger : accentColor }]}>
              <Text style={[styles.rupee, { color: errors.amount ? colors.danger : accentColor }]}>₹</Text>
              <TextInput
                value={amount}
                onChangeText={(t) => { setAmount(t.replace(/[^0-9.]/g, "")); setErrors((e) => ({ ...e, amount: "" })); }}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                style={[styles.amountInput, { color: colors.text }]}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
            {errors.amount ? <Text style={[styles.errText, { color: colors.danger }]}>{errors.amount}</Text> : null}
          </View>

          {/* Category Picker */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Category <Text style={{ color: colors.danger }}>*</Text>
              </Text>
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
                  <View style={[styles.catIcon, { backgroundColor: selectedCategory.color + "18", borderRadius: 10 }]}>
                    <Feather name={selectedCategory.icon as any} size={20} color={selectedCategory.color} />
                  </View>
                  <Text style={[styles.catName, { color: selectedCategory.color }]}>{selectedCategory.name}</Text>
                  <Feather name="chevron-right" size={16} color={selectedCategory.color} />
                </>
              ) : (
                <>
                  <View style={[styles.catIcon, { backgroundColor: colors.muted, borderRadius: 10 }]}>
                    <Feather name="grid" size={20} color={colors.textTertiary} />
                  </View>
                  <Text style={[styles.catPlaceholder, { color: colors.textTertiary }]}>Tap to select category…</Text>
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
            <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Method</Text>
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
                    <Text style={[styles.pmText, { color: sel ? "#FFFFFF" : colors.textSecondary }]}>
                      {PAYMENT_METHOD_LABELS[pm]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Remarks */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Remarks <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: errors.remarks ? colors.danger : colors.border, borderRadius: 14 }]}>
              <Feather name="edit-3" size={15} color={colors.textTertiary} />
              <TextInput
                value={remarks}
                onChangeText={(t) => { setRemarks(t); setErrors((e) => ({ ...e, remarks: "" })); }}
                placeholder="Brief description"
                placeholderTextColor={colors.textTertiary}
                style={[styles.inputField, { color: colors.text }]}
              />
            </View>
            {errors.remarks ? <Text style={[styles.errText, { color: colors.danger }]}>{errors.remarks}</Text> : null}
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Notes (optional)</Text>
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

          {/* Actions */}
          <View style={styles.actions}>
            <Button label="Cancel" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
            <Button label="Save Changes" onPress={handleSave} loading={loading} style={{ flex: 2 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CategoryPickerModal
        visible={catModalVisible}
        onClose={() => setCatModalVisible(false)}
        onSelect={handleCategorySelect}
        selectedId={selectedCategory?.id}
        transactionType={txType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 18 },
  editedBanner: { flexDirection: "row", alignItems: "center", gap: 8, margin: 16, marginBottom: 0, padding: 12, borderRadius: 10 },
  editedText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
  prevCard: { padding: 14 },
  prevLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginBottom: 4 },
  prevAmount: { fontFamily: "Inter_600SemiBold", fontSize: 16, marginBottom: 2 },
  prevRemarks: { fontFamily: "Inter_400Regular", fontSize: 13 },
  scroll: { padding: 20, paddingBottom: 60 },
  field: { marginBottom: 24 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  label: { fontFamily: "Inter_500Medium", fontSize: 14, marginBottom: 12 },
  amountWrap: { flexDirection: "row", alignItems: "center", borderBottomWidth: 2, paddingBottom: 8 },
  rupee: { fontFamily: "Inter_700Bold", fontSize: 28 },
  amountInput: { fontFamily: "Inter_700Bold", fontSize: 36, minWidth: 100, flex: 1 },
  catPickerBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1.5 },
  catIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  catName: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  catPlaceholder: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  pmChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5 },
  pmText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 52, borderWidth: 1.5 },
  inputField: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  textareaWrap: { paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, minHeight: 88 },
  textarea: { fontFamily: "Inter_400Regular", fontSize: 15, flex: 1 },
  errText: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginTop: 8, paddingBottom: 20 },
});
