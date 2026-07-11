import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTransactions } from "@/context/TransactionContext";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { SearchBar } from "@/components/ui/SearchBar";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Transaction } from "@/types";
import { formatIndianCurrency } from "@/utils/format";

const FILTERS = ["All", "Income", "Expense", "Today", "Week", "Month"];

function isToday(d: string) {
  return d === new Date().toISOString().split("T")[0];
}
function isThisWeek(d: string) {
  const diff = (Date.now() - new Date(d).getTime()) / 86400000;
  return diff >= 0 && diff <= 7;
}
function isThisMonth(d: string) {
  const date = new Date(d);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export default function LedgerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, deleteTransaction } = useTransactions();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const topPad = insets.top + 16;

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.remarks.toLowerCase().includes(q) ||
        (t.category?.name.toLowerCase().includes(q) ?? false) ||
        String(t.amount).includes(q)
      );
    }
    if (filter === "Income") list = list.filter((t) => t.type === "credit");
    else if (filter === "Expense") list = list.filter((t) => t.type === "debit");
    else if (filter === "Today") list = list.filter((t) => isToday(t.date));
    else if (filter === "Week") list = list.filter((t) => isThisWeek(t.date));
    else if (filter === "Month") list = list.filter((t) => isThisMonth(t.date));
    return list;
  }, [transactions, search, filter]);

  const totalIncome = filtered.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const netAmount = totalIncome - totalExpense;

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") { deleteTransaction(id); return; }
    Alert.alert("Delete Transaction", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  const handleEdit = (t: Transaction) =>
    router.push({ pathname: "/edit-transaction", params: { id: t.id } });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Ledger</Text>
          <Pressable
            onPress={() => router.push("/add-transaction")}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.primary, borderRadius: 12, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>New Entry</Text>
          </Pressable>
        </View>

        {/* Summary Pills */}
        <View style={[styles.summaryRow, { backgroundColor: colors.background, borderRadius: 14 }]}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: colors.income }]} />
            <View>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Income</Text>
              <Text style={[styles.summaryAmount, { color: colors.income }]}>{formatIndianCurrency(totalIncome)}</Text>
            </View>
          </View>
          <View style={[styles.summaryDiv, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: colors.expense }]} />
            <View>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Expense</Text>
              <Text style={[styles.summaryAmount, { color: colors.expense }]}>{formatIndianCurrency(totalExpense)}</Text>
            </View>
          </View>
          <View style={[styles.summaryDiv, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: netAmount >= 0 ? colors.primary : colors.danger }]} />
            <View>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Net</Text>
              <Text style={[styles.summaryAmount, { color: netAmount >= 0 ? colors.primary : colors.danger }]}>
                {formatIndianCurrency(netAmount)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search + Filters */}
      <View style={[styles.searchSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search amount, category, remarks…" />
        <View style={{ marginTop: 12 }}>
          <FilterChipGroup options={FILTERS} selected={filter} onSelect={setFilter} />
        </View>
      </View>

      {/* Count indicator */}
      {search || filter !== "All" ? (
        <View style={[styles.resultBar, { backgroundColor: colors.accent }]}>
          <Feather name="filter" size={12} color={colors.primary} />
          <Text style={[styles.resultText, { color: colors.primary }]}>
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
          </Text>
          <Pressable onPress={() => { setSearch(""); setFilter("All"); }}>
            <Text style={[styles.clearFilter, { color: colors.primary }]}>Clear</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionCard transaction={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="inbox"
            title="No Transactions"
            description={search ? `No results for "${search}"` : "No transactions match the selected filter."}
            actionLabel="Add Transaction"
            onAction={() => router.push("/add-transaction")}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },
  summaryRow: { flexDirection: "row", padding: 14 },
  summaryItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginBottom: 3 },
  summaryAmount: { fontFamily: "Inter_700Bold", fontSize: 14 },
  summaryDiv: { width: 1, marginVertical: 4 },
  searchSection: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  resultBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  resultText: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  clearFilter: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
