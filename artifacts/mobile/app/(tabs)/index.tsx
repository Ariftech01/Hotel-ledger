import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useHotel } from "@/context/HotelContext";
import { useTransactions } from "@/context/TransactionContext";
import { HotelSelector } from "@/components/ui/HotelSelector";
import { StatCard } from "@/components/ui/StatCard";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { formatIndianCurrency } from "@/utils/format";
import type { Transaction, DashboardSummary } from "@/types";

const DATE_FILTERS = ["Today", "Week", "Month", "Year"];

const QUICK_ACTIONS = [
  { label: "Add Entry", icon: "plus-circle", color: "#1E40AF", bg: "#EFF6FF", action: "/add-transaction" },
  { label: "Ledger", icon: "list", color: "#059669", bg: "#D1FAE5", action: null },
  { label: "Reports", icon: "bar-chart-2", color: "#D97706", bg: "#FEF3C7", action: null },
  { label: "Customers", icon: "users", color: "#7C3AED", bg: "#EDE9FE", action: "/customers" },
  { label: "Invoices", icon: "file-text", color: "#0891B2", bg: "#CFFAFE", action: "/invoice/index" },
  { label: "Categories", icon: "grid", color: "#DB2777", bg: "#FCE7F3", action: "/categories" },
];

function GreetingSection({ name, insets }: { name: string; insets: any }) {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.greetingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.greetingText}>{greeting()},</Text>
        <Text style={styles.greetingName}>{name.split(" ")[0]} 👋</Text>
        <View style={{ marginTop: 10 }}>
          <HotelSelector />
        </View>
      </View>
      <Pressable onPress={() => router.push("/notifications")} style={styles.notifBtn}>
        <Feather name="bell" size={20} color="rgba(255,255,255,0.9)" />
        <View style={styles.notifBadge} />
      </Pressable>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { selectedHotel } = useHotel();
  const { transactions } = useTransactions();
  const [dateFilter, setDateFilter] = useState("Today");

  const { data: dashboardData, isLoading: isDashboardLoading, refetch } = useQuery({
    queryKey: ["dashboard", selectedHotel?.id],
    queryFn: () => {
      const url = selectedHotel ? `/dashboard?hotelId=${selectedHotel.id}` : "/dashboard";
      return customFetch<{ summary: DashboardSummary; monthlyData: any[] }>(url);
    },
    enabled: !!user,
  });

  const d = dashboardData?.summary || {
    todayIncome: 0,
    todayExpense: 0,
    cashBalance: 0,
    bankBalance: 0,
    netProfit: 0,
    pendingPayments: 0,
    pendingCollections: 0,
    monthIncome: 0,
    monthExpense: 0,
  };

  const recent = transactions.slice(0, 5);
  const topPad = insets.top + (Platform.OS === "web" ? 16 : 16);

  const handleEdit = (t: Transaction) =>
    router.push({ pathname: "/edit-transaction", params: { id: t.id } });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Hero Header */}
      <View style={[styles.hero, { paddingTop: topPad, backgroundColor: colors.primary }]}>
        <GreetingSection name={user?.name ?? "User"} insets={insets} />

        {/* Net Profit Hero Card */}
        <View style={styles.profitCard}>
          <View style={styles.profitCardInner}>
            <View>
              <Text style={styles.profitCardLabel}>Today's Net Profit</Text>
              <Text style={styles.profitCardAmount}>{formatIndianCurrency(d.netProfit)}</Text>
              <View style={styles.profitSubRow}>
                <View style={styles.profitSubItem}>
                  <View style={[styles.profitSubDot, { backgroundColor: "#6EE7B7" }]} />
                  <Text style={styles.profitSubText}>↑ {formatIndianCurrency(d.todayIncome)}</Text>
                </View>
                <View style={styles.profitSubItem}>
                  <View style={[styles.profitSubDot, { backgroundColor: "#FCA5A5" }]} />
                  <Text style={styles.profitSubText}>↓ {formatIndianCurrency(d.todayExpense)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.profitTrendBadge}>
              <Feather name="trending-up" size={20} color="#6EE7B7" />
              <Text style={styles.profitTrendText}>+18%</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isDashboardLoading} onRefresh={refetch} />
        }
      >
        {/* Filter Chips */}
        <View style={styles.filterSection}>
          <FilterChipGroup options={DATE_FILTERS} selected={dateFilter} onSelect={setDateFilter} />
        </View>

        {/* Stat Cards 2x2 */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard label="Cash Balance" amount={d.cashBalance} icon="dollar-sign" iconColor={colors.secondary} iconBg={colors.successLight} trend={5.2} />
            <StatCard label="Bank Balance" amount={d.bankBalance} icon="credit-card" iconColor={colors.primary} iconBg={colors.accent} trend={12.8} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="To Pay" amount={d.pendingPayments} icon="clock" iconColor={colors.warning} iconBg={colors.warningLight} sublabel="3 pending" />
            <StatCard label="To Collect" amount={d.pendingCollections} icon="inbox" iconColor={colors.danger} iconBg={colors.dangerLight} sublabel="5 outstanding" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => item.action && router.push(item.action as any)}
                style={({ pressed }) => [
                  styles.quickItem,
                  {
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <View style={[styles.quickIcon, { backgroundColor: item.bg, borderRadius: 12 }]}>
                  <Feather name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Month Summary Bar */}
        <View style={styles.section}>
          <View style={[styles.monthBar, { backgroundColor: colors.card, borderRadius: 16, borderColor: colors.border }]}>
            {[
              { label: "Month Income", amount: d.monthIncome, color: colors.income },
              { label: "Month Expense", amount: d.monthExpense, color: colors.expense },
              { label: "Net Profit", amount: d.monthIncome - d.monthExpense, color: colors.primary },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View style={[styles.monthDivider, { backgroundColor: colors.border }]} />}
                <View style={styles.monthItem}>
                  <View style={[styles.monthDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.monthLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                  <Text style={[styles.monthAmount, { color: item.color }]}>
                    {formatIndianCurrency(item.amount)}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.section, { paddingHorizontal: 0 }]}>
          <View style={[styles.sectionHeaderRow, { paddingHorizontal: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <Pressable onPress={() => router.push("/(tabs)/ledger" as any)} style={styles.seeAllBtn}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              <Feather name="arrow-right" size={14} color={colors.primary} />
            </Pressable>
          </View>
          {recent.map((t) => (
            <TransactionCard key={t.id} transaction={t} onEdit={handleEdit} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  greetingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greetingText: { fontFamily: "Inter_400Regular", fontSize: 15, color: "rgba(255,255,255,0.8)" },
  greetingName: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#FFFFFF", marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  notifBadge: { position: "absolute", top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#1E40AF" },
  profitCard: { backgroundColor: "rgba(255,255,255,0.13)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  profitCardInner: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  profitCardLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 8 },
  profitCardAmount: { fontFamily: "Inter_700Bold", fontSize: 38, color: "#FFFFFF", letterSpacing: -0.5 },
  profitSubRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  profitSubItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  profitSubDot: { width: 6, height: 6, borderRadius: 3 },
  profitSubText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.85)" },
  profitTrendBadge: { alignItems: "center", gap: 4, backgroundColor: "rgba(110,231,183,0.15)", borderRadius: 12, padding: 12 },
  profitTrendText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#6EE7B7" },
  filterSection: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  statsGrid: { paddingHorizontal: 16, gap: 12, marginBottom: 4 },
  statsRow: { flexDirection: "row", gap: 12 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 17, marginBottom: 14 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAll: { fontFamily: "Inter_500Medium", fontSize: 14 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickItem: { width: "30%", alignItems: "center", paddingVertical: 16, paddingHorizontal: 8, gap: 10, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  quickIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontFamily: "Inter_500Medium", fontSize: 11, textAlign: "center" },
  monthBar: { flexDirection: "row", padding: 20, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  monthItem: { flex: 1, alignItems: "center", gap: 6 },
  monthDivider: { width: 1, marginVertical: 4 },
  monthDot: { width: 7, height: 7, borderRadius: 3.5 },
  monthLabel: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" },
  monthAmount: { fontFamily: "Inter_700Bold", fontSize: 14, textAlign: "center" },
});
