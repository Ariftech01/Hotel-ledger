import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTransactions } from "@/context/TransactionContext";
import { useCategories } from "@/context/CategoryContext";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { MOCK_MONTHLY_DATA } from "@/services/mockData";
import { formatCompactCurrency, formatIndianCurrency } from "@/utils/format";

const PERIODS = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];

function BarChart({ data }: { data: { month: string; income: number; expense: number }[] }) {
  const colors = useColors();
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);

  return (
    <View style={{ height: 160, flexDirection: "row", alignItems: "flex-end", gap: 6, paddingTop: 8 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center", gap: 2 }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 2, width: "100%" }}>
            <View style={{ flex: 1, height: Math.max(4, (d.income / maxVal) * 130), backgroundColor: colors.income, borderRadius: 4 }} />
            <View style={{ flex: 1, height: Math.max(4, (d.expense / maxVal) * 130), backgroundColor: colors.expense, borderRadius: 4 }} />
          </View>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 9, color: colors.textTertiary }}>{d.month}</Text>
        </View>
      ))}
    </View>
  );
}

interface CategoryRowProps {
  name: string; amount: number; total: number; color: string; icon: string; count?: number;
}

function CategoryRow({ name, amount, total, color, icon, count }: CategoryRowProps) {
  const colors = useColors();
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <View style={catStyles.wrap}>
      <View style={[catStyles.icon, { backgroundColor: color + "18", borderRadius: 10 }]}>
        <Feather name={icon as any} size={15} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={catStyles.topRow}>
          <Text style={[catStyles.name, { color: colors.text }]} numberOfLines={1}>{name}</Text>
          <Text style={[catStyles.amount, { color: colors.text }]}>{formatCompactCurrency(amount)}</Text>
        </View>
        <View style={[catStyles.track, { backgroundColor: colors.muted }]}>
          <View style={[catStyles.fill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: color }]} />
        </View>
        <View style={catStyles.metaRow}>
          <Text style={[catStyles.pct, { color: colors.textTertiary }]}>{pct.toFixed(1)}%</Text>
          {count !== undefined && <Text style={[catStyles.pct, { color: colors.textTertiary }]}>{count} txns</Text>}
        </View>
      </View>
    </View>
  );
}

const catStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  icon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  name: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  amount: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  track: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 3 },
  fill: { height: 6, borderRadius: 3 },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  pct: { fontFamily: "Inter_400Regular", fontSize: 10 },
});

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const [period, setPeriod] = useState("Monthly");
  const topPad = insets.top + 16;

  const totalIncome = MOCK_MONTHLY_DATA.reduce((s, d) => s + d.income, 0);
  const totalExpense = MOCK_MONTHLY_DATA.reduce((s, d) => s + d.expense, 0);
  const totalProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : "0";

  const catData = useMemo(() => {
    const map: Record<string, { cat: typeof categories[0]; income: number; expense: number; count: number }> = {};
    for (const t of transactions) {
      const catId = t.categoryId;
      const cat = t.category ?? categories.find((c) => c.id === catId);
      if (!cat) continue;
      if (!map[catId]) map[catId] = { cat, income: 0, expense: 0, count: 0 };
      if (t.type === "credit") map[catId].income += t.amount;
      else map[catId].expense += t.amount;
      map[catId].count++;
    }
    return Object.values(map);
  }, [transactions, categories]);

  const topExpenses = useMemo(
    () => catData.filter((x) => x.expense > 0).sort((a, b) => b.expense - a.expense).slice(0, 6),
    [catData]
  );
  const topIncome = useMemo(
    () => catData.filter((x) => x.income > 0).sort((a, b) => b.income - a.income).slice(0, 6),
    [catData]
  );

  const maxExpense = Math.max(...topExpenses.map((x) => x.expense), 1);
  const maxIncome = Math.max(...topIncome.map((x) => x.income), 1);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Reports</Text>
        <Pressable
          onPress={() => router.push("/report-export")}
          style={({ pressed }) => [
            styles.exportBtn,
            { backgroundColor: colors.primary, borderRadius: 12, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="download" size={15} color="#FFFFFF" />
          <Text style={styles.exportText}>Export PDF</Text>
        </Pressable>
      </View>

      <View style={styles.periodSection}>
        <FilterChipGroup options={PERIODS} selected={period} onSelect={setPeriod} />
      </View>

      {/* KPI */}
      <View style={styles.kpiRow}>
        {[
          { label: "Total Revenue", amount: totalIncome, color: colors.income, icon: "arrow-up-right", bg: colors.incomeLight },
          { label: "Total Expense", amount: totalExpense, color: colors.expense, icon: "arrow-down-right", bg: colors.expenseLight },
          { label: "Net Profit", amount: totalProfit, color: colors.primary, icon: "trending-up", bg: colors.accent },
        ].map((item) => (
          <View key={item.label} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16 }]}>
            <View style={[styles.kpiIcon, { backgroundColor: item.bg, borderRadius: 10 }]}>
              <Feather name={item.icon as any} size={16} color={item.color} />
            </View>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            <Text style={[styles.kpiAmount, { color: item.color }]}>{formatCompactCurrency(item.amount)}</Text>
          </View>
        ))}
      </View>

      {/* Bar Chart */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Income vs Expense</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>2026</Text>
        </View>
        <View style={styles.legendRow}>
          {[{ label: "Income", color: colors.income }, { label: "Expense", color: colors.expense }].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{l.label}</Text>
            </View>
          ))}
        </View>
        <BarChart data={MOCK_MONTHLY_DATA} />
      </View>

      {/* YTD Net Profit Card */}
      <View style={[styles.marginCard, { backgroundColor: colors.primary }]}>
        <View style={styles.marginLeft}>
          <Text style={styles.marginLabel}>YTD Net Profit</Text>
          <Text style={styles.marginAmount}>{formatIndianCurrency(totalProfit)}</Text>
          <View style={styles.marginSubRow}>
            <Feather name="trending-up" size={14} color="#6EE7B7" />
            <Text style={styles.marginSub}>+18.4% vs last year</Text>
          </View>
        </View>
        <View style={styles.marginRight}>
          <Text style={styles.marginPctLabel}>Margin</Text>
          <Text style={styles.marginPct}>{profitMargin}%</Text>
        </View>
      </View>

      {/* Category Summary */}
      {catData.length > 0 && (
        <>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 20 }]}>Top Expenses by Category</Text>
            {topExpenses.map(({ cat, expense, count }) => (
              <CategoryRow key={cat.id} name={cat.name} amount={expense} total={maxExpense} color={cat.color} icon={cat.icon} count={count} />
            ))}
            {topExpenses.length === 0 && <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 }}>No expense data</Text>}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 20 }]}>Income Sources by Category</Text>
            {topIncome.map(({ cat, income, count }) => (
              <CategoryRow key={cat.id} name={cat.name} amount={income} total={maxIncome} color={cat.color} icon={cat.icon} count={count} />
            ))}
            {topIncome.length === 0 && <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 }}>No income data</Text>}
          </View>
        </>
      )}

      {/* Fallback if no real transaction data */}
      {catData.length === 0 && (
        <>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 20 }]}>Top Expenses</Text>
            {[
              { name: "Staff Salary", amount: 125000, icon: "users", color: "#EF4444" },
              { name: "Grocery", amount: 8500, icon: "shopping-cart", color: "#8B5CF6" },
              { name: "Electricity Bill", amount: 3200, icon: "zap", color: "#F59E0B" },
            ].map((item) => (
              <CategoryRow key={item.name} name={item.name} amount={item.amount} total={125000} color={item.color} icon={item.icon} />
            ))}
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 20 }]}>Income Sources</Text>
            {[
              { name: "Room Rent", amount: 128000, icon: "home", color: "#059669" },
              { name: "Restaurant Sales", amount: 31000, icon: "coffee", color: "#F59E0B" },
              { name: "Conference Hall", amount: 25000, icon: "users", color: "#0EA5E9" },
            ].map((item) => (
              <CategoryRow key={item.name} name={item.name} amount={item.amount} total={128000} color={item.color} icon={item.icon} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, shadowColor: "#1E40AF", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  exportText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#FFFFFF" },
  periodSection: { paddingHorizontal: 16, paddingVertical: 16 },
  kpiRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  kpiCard: { flex: 1, padding: 14, borderWidth: 1, alignItems: "center", gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  kpiIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  kpiLabel: { fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "center" },
  kpiAmount: { fontFamily: "Inter_700Bold", fontSize: 13, textAlign: "center" },
  card: { marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  cardSub: { fontFamily: "Inter_400Regular", fontSize: 13 },
  legendRow: { flexDirection: "row", gap: 16, marginBottom: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  marginCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 20, padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#1E40AF", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  marginLeft: { flex: 1 },
  marginLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 8 },
  marginAmount: { fontFamily: "Inter_700Bold", fontSize: 28, color: "#FFFFFF", letterSpacing: -0.5, marginBottom: 10 },
  marginSubRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  marginSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.8)" },
  marginRight: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16, padding: 16 },
  marginPctLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  marginPct: { fontFamily: "Inter_700Bold", fontSize: 28, color: "#FFFFFF" },
});
