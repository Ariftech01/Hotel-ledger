import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Transaction } from "@/types";
import { formatDate, formatTime, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS } from "@/utils/format";

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const isCredit = transaction.type === "credit";
  const cat = transaction.category;
  const catColor = cat?.color ?? colors.primary;
  const amountColor = isCredit ? colors.income : colors.expense;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(expandAnim, { toValue, useNativeDriver: false, tension: 120, friction: 14 }).start();
    setExpanded(!expanded);
    if (Platform.OS !== "web") Haptics.selectionAsync();
  };

  const handlePressIn = () =>
    Animated.spring(pressAnim, { toValue: 0.98, useNativeDriver: true, tension: 300, friction: 20 }).start();

  const handlePressOut = () =>
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }).start();

  const expandHeight = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 108] });
  const expandOpacity = expandAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.5, 1] });

  const pmIcon = PAYMENT_METHOD_ICONS[transaction.paymentMethod] ?? "dollar-sign";
  const pmLabel = PAYMENT_METHOD_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod;

  return (
    <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
      <Pressable
        onPress={toggleExpand}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderRadius: 16,
            marginHorizontal: 16,
            marginVertical: 3,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Left accent stripe */}
        <View style={[styles.stripe, { backgroundColor: catColor }]} />

        <View style={styles.row}>
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: catColor + "18", borderRadius: 12 }]}>
            <Feather name={(cat?.icon as any) ?? "circle"} size={19} color={catColor} />
          </View>

          {/* Middle content */}
          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={[styles.category, { color: colors.text }]} numberOfLines={1}>
                {cat?.name ?? "Uncategorized"}
              </Text>
              {transaction.isEdited && (
                <View style={[styles.editedPill, { backgroundColor: colors.warningLight }]}>
                  <Feather name="edit-2" size={9} color={colors.warning} />
                  <Text style={[styles.editedText, { color: colors.warning }]}>Edited</Text>
                </View>
              )}
            </View>

            <Text style={[styles.remarks, { color: colors.mutedForeground }]} numberOfLines={1}>
              {transaction.remarks}
            </Text>

            <View style={styles.metaRow}>
              <Feather name="calendar" size={10} color={colors.textTertiary} />
              <Text style={[styles.meta, { color: colors.textTertiary }]}>{formatDate(transaction.date)}</Text>
              <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
              <Feather name={pmIcon as any} size={10} color={colors.textTertiary} />
              <Text style={[styles.meta, { color: colors.textTertiary }]}>{pmLabel}</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountCol}>
            <Text style={[styles.amount, { color: amountColor }]}>
              {isCredit ? "+" : "−"}₹{transaction.amount.toLocaleString("en-IN")}
            </Text>
            <View style={[styles.typePill, { backgroundColor: isCredit ? colors.incomeLight : colors.expenseLight }]}>
              <Text style={[styles.typeText, { color: amountColor }]}>{isCredit ? "Credit" : "Debit"}</Text>
            </View>
          </View>
        </View>

        {/* Expandable section */}
        <Animated.View style={{ height: expandHeight, overflow: "hidden" }}>
          <Animated.View style={{ opacity: expandOpacity }}>
            <View style={[styles.expandDivider, { backgroundColor: colors.border }]} />
            <View style={styles.expanded}>
              {transaction.runningBalance !== undefined && (
                <View style={styles.expandRow}>
                  <Text style={[styles.expandLabel, { color: colors.mutedForeground }]}>Running Balance</Text>
                  <Text style={[styles.expandValue, { color: colors.text }]}>
                    ₹{transaction.runningBalance.toLocaleString("en-IN")}
                  </Text>
                </View>
              )}
              {transaction.isEdited && transaction.editedAt && (
                <View style={styles.expandRow}>
                  <Text style={[styles.expandLabel, { color: colors.mutedForeground }]}>Last edited by</Text>
                  <Text style={[styles.expandValue, { color: colors.warning }]}>
                    {transaction.editedBy} · {formatDate(transaction.editedAt)}
                  </Text>
                </View>
              )}
              {transaction.description && (
                <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                  {transaction.description}
                </Text>
              )}
              <View style={styles.actions}>
                {onEdit && (
                  <Pressable
                    onPress={(e) => { e.stopPropagation?.(); onEdit(transaction); }}
                    style={[styles.actionBtn, { backgroundColor: colors.accent, borderRadius: 10 }]}
                  >
                    <Feather name="edit-2" size={13} color={colors.primary} />
                    <Text style={[styles.actionLabel, { color: colors.primary }]}>Edit</Text>
                  </Pressable>
                )}
                {onDelete && (
                  <Pressable
                    onPress={(e) => { e.stopPropagation?.(); onDelete(transaction.id); }}
                    style={[styles.actionBtn, { backgroundColor: colors.dangerLight, borderRadius: 10 }]}
                  >
                    <Feather name="trash-2" size={13} color={colors.danger} />
                    <Text style={[styles.actionLabel, { color: colors.danger }]}>Delete</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingLeft: 16, paddingRight: 14, gap: 12 },
  iconWrap: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  category: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
  editedPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  editedText: { fontFamily: "Inter_600SemiBold", fontSize: 9 },
  remarks: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 5, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  meta: { fontFamily: "Inter_400Regular", fontSize: 11 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5 },
  amountCol: { alignItems: "flex-end", gap: 5 },
  amount: { fontFamily: "Inter_700Bold", fontSize: 15 },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  typeText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  expandDivider: { height: 1, marginHorizontal: 16 },
  expanded: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  expandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  expandLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  expandValue: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  description: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, marginBottom: 10 },
  actions: { flexDirection: "row", gap: 8, marginTop: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  actionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
