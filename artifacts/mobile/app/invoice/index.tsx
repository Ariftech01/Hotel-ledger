import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_INVOICES } from "@/services/mockData";
import { SearchBar } from "@/components/ui/SearchBar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { formatDate, formatIndianCurrency } from "@/utils/format";
import type { InvoiceStatus } from "@/types";

const STATUS_FILTERS = ["All", "Draft", "Sent", "Paid", "Overdue"];

const STATUS_VARIANTS: Record<InvoiceStatus, "neutral" | "info" | "success" | "danger" | "warning"> = {
  draft: "neutral",
  sent: "info",
  paid: "success",
  overdue: "danger",
  cancelled: "warning",
};

export default function InvoiceListScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);

  const filtered = MOCK_INVOICES.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "All" || inv.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((s, i) => s + i.total, 0);
  const paidAmount = filtered.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Invoices</Text>
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}>
          <Feather name="plus" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={[styles.summaryBar, { backgroundColor: colors.primary }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.sumLabel}>Total</Text>
          <Text style={styles.sumValue}>{formatIndianCurrency(totalAmount)}</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.sumLabel}>Collected</Text>
          <Text style={styles.sumValue}>{formatIndianCurrency(paidAmount)}</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.sumLabel}>Pending</Text>
          <Text style={styles.sumValue}>{formatIndianCurrency(totalAmount - paidAmount)}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search invoice number, customer..." />
        <View style={{ marginTop: 12 }}>
          <FilterChipGroup options={STATUS_FILTERS} selected={statusFilter} onSelect={setStatusFilter} />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={[styles.invoiceCard, { backgroundColor: colors.card, borderRadius: colors.radius, marginHorizontal: 16, marginVertical: 4, borderColor: colors.border }]}>
            <View style={styles.invoiceTop}>
              <View>
                <Text style={[styles.invNumber, { color: colors.text }]}>{item.invoiceNumber}</Text>
                <Text style={[styles.invCustomer, { color: colors.mutedForeground }]}>{item.customer?.name}</Text>
              </View>
              <Badge label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} variant={STATUS_VARIANTS[item.status] ?? "neutral"} size="md" />
            </View>
            <View style={[styles.invDivider, { backgroundColor: colors.border }]} />
            <View style={styles.invoiceBottom}>
              <View>
                <Text style={[styles.invLabel, { color: colors.mutedForeground }]}>Invoice Date</Text>
                <Text style={[styles.invValue, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
              </View>
              <View>
                <Text style={[styles.invLabel, { color: colors.mutedForeground }]}>Due Date</Text>
                <Text style={[styles.invValue, { color: item.status === "overdue" ? colors.danger : colors.textSecondary }]}>{formatDate(item.dueDate)}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.invLabel, { color: colors.mutedForeground }]}>Total</Text>
                <Text style={[styles.invTotal, { color: colors.text }]}>{formatIndianCurrency(item.total)}</Text>
              </View>
            </View>
            <View style={styles.invoiceActions}>
              {[{ icon: "eye", label: "View" }, { icon: "share-2", label: "Share" }, { icon: "printer", label: "Print" }].map((action) => (
                <Pressable key={action.icon} style={[styles.invActionBtn, { backgroundColor: colors.muted, borderRadius: 6 }]}>
                  <Feather name={action.icon as any} size={14} color={colors.primary} />
                  <Text style={[styles.invActionLabel, { color: colors.primary }]}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        )}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="file-text" title="No Invoices" description={search ? `No results for "${search}"` : "No invoices created yet."} actionLabel="Create Invoice" onAction={() => {}} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22 },
  addBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  summaryBar: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 16 },
  summaryItem: { flex: 1, alignItems: "center" },
  sumLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  sumValue: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFFFFF" },
  sumDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)", marginVertical: 4 },
  invoiceCard: { padding: 16, marginBottom: 4, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  invoiceTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  invNumber: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 2 },
  invCustomer: { fontFamily: "Inter_400Regular", fontSize: 13 },
  invDivider: { height: 1, marginBottom: 12 },
  invoiceBottom: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  invLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginBottom: 3 },
  invValue: { fontFamily: "Inter_500Medium", fontSize: 13 },
  invTotal: { fontFamily: "Inter_700Bold", fontSize: 17 },
  invoiceActions: { flexDirection: "row", gap: 8 },
  invActionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7 },
  invActionLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
