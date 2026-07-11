import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_VENDORS } from "@/services/mockData";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatIndianCurrency } from "@/utils/format";

export default function VendorsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);

  const filtered = MOCK_VENDORS.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.phone.includes(search)
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Vendors</Text>
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}>
          <Feather name="plus" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={{ padding: 16 }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search vendors..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={[styles.vendorCard, { backgroundColor: colors.card, borderRadius: colors.radius, marginHorizontal: 16, marginVertical: 4, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: "#8B5CF620", borderRadius: 24 }]}>
              <Feather name="briefcase" size={20} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.vendorName, { color: colors.text }]}>{item.name}</Text>
                {item.outstanding > 0 && <Badge label="Due" variant="warning" />}
              </View>
              <Text style={[styles.vendorPhone, { color: colors.mutedForeground }]}>{item.phone}</Text>
              <View style={styles.amountRow}>
                <View>
                  <Text style={[styles.amtLabel, { color: colors.mutedForeground }]}>Outstanding</Text>
                  <Text style={[styles.amtValue, { color: item.outstanding > 0 ? colors.warning : colors.success }]}>
                    {formatIndianCurrency(item.outstanding)}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.amtLabel, { color: colors.mutedForeground }]}>Total Purchased</Text>
                  <Text style={[styles.amtValue, { color: colors.text }]}>{formatIndianCurrency(item.totalPurchased)}</Text>
                </View>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textTertiary} />
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="briefcase" title="No Vendors" description={search ? `No results for "${search}"` : "No vendors yet."} />}
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
  vendorCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatar: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  vendorName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  vendorPhone: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 8 },
  amountRow: { flexDirection: "row", gap: 24 },
  amtLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginBottom: 2 },
  amtValue: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
