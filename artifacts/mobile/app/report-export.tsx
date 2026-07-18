import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTransactions } from "@/context/TransactionContext";
import { useHotel } from "@/context/HotelContext";
import { useAuth } from "@/context/AuthContext";
import { generateAndSharePDF } from "@/utils/pdfExport";
import { formatDate, formatIndianCurrency } from "@/utils/format";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/utils/supabase";

type DateRangeOption = "today" | "yesterday" | "week" | "month" | "quarter" | "year";
type TxFilter = "all" | "income" | "expense";

const DATE_OPTIONS: { key: DateRangeOption; label: string; icon: string }[] = [
  { key: "today",     label: "Today",          icon: "sun" },
  { key: "yesterday", label: "Yesterday",       icon: "sunset" },
  { key: "week",      label: "This Week",       icon: "calendar" },
  { key: "month",     label: "This Month",      icon: "calendar" },
  { key: "quarter",   label: "This Quarter",    icon: "bar-chart-2" },
  { key: "year",      label: "This Year",       icon: "trending-up" },
];

function getDateRange(option: DateRangeOption): { from: string; to: string; label: string } {
  const now = new Date();
  const toStr = (d: Date) => d.toISOString().split("T")[0];
  const today = toStr(now);

  if (option === "today") return { from: today, to: today, label: "Today" };
  if (option === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    const s = toStr(y);
    return { from: s, to: s, label: "Yesterday" };
  }
  if (option === "week") {
    const s = new Date(now); s.setDate(now.getDate() - 7);
    return { from: toStr(s), to: today, label: "Last 7 Days" };
  }
  if (option === "month") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toStr(s), to: today, label: `${now.toLocaleString("en-IN", { month: "long" })} ${now.getFullYear()}` };
  }
  if (option === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const s = new Date(now.getFullYear(), q * 3, 1);
    return { from: toStr(s), to: today, label: `Q${q + 1} ${now.getFullYear()}` };
  }
  const s = new Date(now.getFullYear(), 0, 1);
  return { from: toStr(s), to: today, label: `FY ${now.getFullYear()}` };
}

export default function ReportExportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactions();
  const { selectedHotel, hotels } = useHotel();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRangeOption>("month");
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [generating, setGenerating] = useState(false);

  const hotel = selectedHotel ?? hotels[0];
  const range = getDateRange(dateRange);

  const filtered = transactions.filter((t) => {
    const inRange = t.date >= range.from && t.date <= range.to;
    if (!inRange) return false;
    if (txFilter === "income") return t.type === "credit";
    if (txFilter === "expense") return t.type === "debit";
    return true;
  });

  const totalIncome = filtered.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  const handleGenerate = async () => {
    if (!hotel) { Alert.alert("No Hotel", "Please select a hotel first."); return; }
    if (filtered.length === 0) { Alert.alert("No Data", "No transactions found for the selected period."); return; }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGenerating(true);
    try {
      await generateAndSharePDF({
        hotel,
        transactions: filtered,
        dateFrom: range.from,
        dateTo: range.to,
        preparedBy: user?.name ?? "Manager",
        filterLabel: range.label,
      });
    } catch (e: any) {
      Alert.alert("Export Failed", e?.message ?? "Could not generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: colors.muted, borderRadius: 10 }]}>
          <Feather name="x" size={18} color={colors.text} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Export Report</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Generate PDF / CSV</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hotel */}
        <View style={[styles.hotelCard, { backgroundColor: colors.primary }]}>
          <View style={[styles.hotelIcon, { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12 }]}>
            <Feather name="home" size={22} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.hotelName}>{hotel?.name ?? "No Hotel Selected"}</Text>
            <Text style={styles.hotelAddr}>{hotel?.address}</Text>
          </View>
        </View>

        {/* Date Range */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Report Period</Text>
        <View style={styles.optionGrid}>
          {DATE_OPTIONS.map((opt) => {
            const active = dateRange === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setDateRange(opt.key)}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: 14,
                  },
                ]}
              >
                <Feather name={opt.icon as any} size={16} color={active ? "#FFFFFF" : colors.textTertiary} />
                <Text style={[styles.optionLabel, { color: active ? "#FFFFFF" : colors.textSecondary }]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Transaction Type Filter */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transactions</Text>
        <View style={styles.txFilterRow}>
          {(["all", "income", "expense"] as TxFilter[]).map((f) => {
            const active = txFilter === f;
            const col = f === "income" ? colors.income : f === "expense" ? colors.expense : colors.primary;
            return (
              <Pressable
                key={f}
                onPress={() => setTxFilter(f)}
                style={[
                  styles.txFilterBtn,
                  { flex: 1, borderRadius: 12, backgroundColor: active ? col + "18" : colors.card, borderColor: active ? col : colors.border },
                ]}
              >
                <Text style={[styles.txFilterText, { color: active ? col : colors.mutedForeground, fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" }]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Preview Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Report Preview</Text>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryItem, { backgroundColor: colors.incomeLight, borderRadius: 12 }]}>
              <Feather name="arrow-up-circle" size={16} color={colors.income} />
              <Text style={[styles.summaryLabel, { color: colors.income }]}>Income</Text>
              <Text style={[styles.summaryAmount, { color: colors.income }]}>{formatIndianCurrency(totalIncome)}</Text>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: colors.expenseLight, borderRadius: 12 }]}>
              <Feather name="arrow-down-circle" size={16} color={colors.expense} />
              <Text style={[styles.summaryLabel, { color: colors.expense }]}>Expense</Text>
              <Text style={[styles.summaryAmount, { color: colors.expense }]}>{formatIndianCurrency(totalExpense)}</Text>
            </View>
          </View>
          <View style={[styles.summaryNetRow, { borderTopColor: colors.border }]}>
            <View style={styles.summaryNetLeft}>
              <Feather name="file-text" size={14} color={colors.mutedForeground} />
              <Text style={[styles.summaryNetLabel, { color: colors.mutedForeground }]}>{filtered.length} transactions · {range.label}</Text>
            </View>
            <Text style={[styles.summaryNetAmount, { color: totalIncome - totalExpense >= 0 ? colors.income : colors.expense }]}>
              Net: {formatIndianCurrency(totalIncome - totalExpense)}
            </Text>
          </View>
        </View>

        {/* Export Buttons */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Export As</Text>
        <Pressable
          onPress={handleGenerate}
          disabled={generating}
          style={({ pressed }) => [
            styles.exportMainBtn,
            { backgroundColor: colors.primary, borderRadius: 16, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="file-text" size={22} color="#FFFFFF" />
          )}
          <View>
            <Text style={styles.exportMainLabel}>{generating ? "Generating PDF…" : "Download PDF Report"}</Text>
            <Text style={styles.exportMainSub}>Professional accounting report · A4 format</Text>
          </View>
          <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>

        <View style={styles.exportSecondRow}>
          {[
            { icon: "grid", label: "Export CSV", sub: "Spreadsheet format" },
            { icon: "share-2", label: "Share Report", sub: "WhatsApp, Email…" },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={async () => {
                if (item.label === "Export CSV") {
                  try {
                    const session = await supabase.auth.getSession();
                    const token = session.data.session?.access_token || "";
                    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
                    const downloadUrl = `${apiUrl}/api/reports?format=csv&hotelId=${hotel?.id}&startDate=${range.from}&endDate=${range.to}&token=${token}`;
                    await WebBrowser.openBrowserAsync(downloadUrl);
                  } catch (e: any) {
                    Alert.alert("Export Failed", e.message || "Failed to download CSV.");
                  }
                } else {
                  // Share/Generate PDF report
                  handleGenerate();
                }
              }}
              style={({ pressed }) => [
                styles.exportSecondBtn,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name={item.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.exportSecondLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.exportSecondSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  scroll: { padding: 20, paddingBottom: 60 },
  hotelCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, padding: 18, marginBottom: 28, shadowColor: "#1E40AF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  hotelIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  hotelName: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFFFFF", marginBottom: 3 },
  hotelAddr: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.75)" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 14, marginTop: 4 },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  optionItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5 },
  optionLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  txFilterRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  txFilterBtn: { alignItems: "center", paddingVertical: 12, borderWidth: 1.5 },
  txFilterText: { fontSize: 14 },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 28, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  summaryTitle: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 16 },
  summaryGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  summaryItem: { flex: 1, padding: 14, gap: 8 },
  summaryLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  summaryAmount: { fontFamily: "Inter_700Bold", fontSize: 16 },
  summaryNetRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  summaryNetLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryNetLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  summaryNetAmount: { fontFamily: "Inter_700Bold", fontSize: 15 },
  exportMainBtn: { flexDirection: "row", alignItems: "center", gap: 16, padding: 20, marginBottom: 14, shadowColor: "#1E40AF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  exportMainLabel: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFFFFF", marginBottom: 3 },
  exportMainSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.75)" },
  exportSecondRow: { flexDirection: "row", gap: 12 },
  exportSecondBtn: { flex: 1, alignItems: "center", padding: 16, gap: 8, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  exportSecondLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  exportSecondSub: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" },
});
