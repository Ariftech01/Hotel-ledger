import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View, Alert, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useHotel } from "@/context/HotelContext";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatIndianCurrency } from "@/utils/format";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import type { Customer } from "@/types";

export default function CustomersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { selectedHotel } = useHotel();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);

  // Fetch live customers from backend
  const { data: customers = [], isLoading, refetch } = useQuery<Customer[]>({
    queryKey: ["customers", selectedHotel?.id],
    queryFn: () => {
      const url = selectedHotel ? `/customers?hotelId=${selectedHotel.id}` : "/customers";
      return customFetch<Customer[]>(url);
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: (newCust: Omit<Customer, "id">) => {
      return customFetch<Customer>("/customers", {
        method: "POST",
        body: JSON.stringify({
          ...newCust,
          hotelId: selectedHotel?.id,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const handleAddCustomer = () => {
    if (Platform.OS === "web") {
      const name = prompt("Enter customer name:");
      const phone = prompt("Enter customer phone number:");
      const email = prompt("Enter customer email (optional):") || "";
      const address = prompt("Enter customer address (optional):") || "";
      if (name && phone) {
        createCustomerMutation.mutate({
          name,
          phone,
          email,
          address,
          outstanding: 0,
          totalPaid: 0,
        });
      }
      return;
    }

    Alert.prompt("New Customer", "Enter customer name", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Next",
        onPress: (name?: string) => {
          if (!name) return;
          Alert.prompt("New Customer", "Enter customer phone number", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Add",
              onPress: (phone?: string) => {
                if (name && phone) {
                  createCustomerMutation.mutate({
                    name,
                    phone,
                    outstanding: 0,
                    totalPaid: 0,
                  });
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const totalOutstanding = customers.reduce((s, c) => s + c.outstanding, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Customers</Text>
        <Pressable
          onPress={handleAddCustomer}
          style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}
        >
          <Feather name="user-plus" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={[styles.summaryBar, { backgroundColor: colors.primary }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.sumLabel}>Total Customers</Text>
          <Text style={styles.sumValue}>{customers.length}</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.sumLabel}>Outstanding</Text>
          <Text style={styles.sumValue}>{formatIndianCurrency(totalOutstanding)}</Text>
        </View>
      </View>

      <View style={[styles.searchSection, { backgroundColor: colors.background }]}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name, phone, email..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <Pressable style={[styles.customerCard, { backgroundColor: colors.card, borderRadius: colors.radius, marginHorizontal: 16, marginVertical: 4, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "20", borderRadius: 24 }]}>
              <Feather name="user" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.custName, { color: colors.text }]}>{item.name}</Text>
                {item.outstanding > 0 && <Badge label="Outstanding" variant="danger" />}
              </View>
              <Text style={[styles.custPhone, { color: colors.mutedForeground }]}>{item.phone}</Text>
              {item.email && <Text style={[styles.custEmail, { color: colors.mutedForeground }]}>{item.email}</Text>}
              <View style={styles.amountRow}>
                <View>
                  <Text style={[styles.amtLabel, { color: colors.mutedForeground }]}>Outstanding</Text>
                  <Text style={[styles.amtValue, { color: item.outstanding > 0 ? colors.danger : colors.success }]}>
                    {formatIndianCurrency(item.outstanding)}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.amtLabel, { color: colors.mutedForeground }]}>Total Paid</Text>
                  <Text style={[styles.amtValue, { color: colors.text }]}>{formatIndianCurrency(item.totalPaid)}</Text>
                </View>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textTertiary} />
          </Pressable>
        )}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title="No Customers"
            description={search ? `No results for "${search}"` : "No customers added yet."}
            actionLabel="Add Customer"
            onAction={handleAddCustomer}
          />
        }
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
  summaryBar: { flexDirection: "row", paddingHorizontal: 24, paddingVertical: 16 },
  summaryItem: { flex: 1, alignItems: "center" },
  sumLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  sumValue: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF" },
  sumDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)", marginVertical: 4 },
  searchSection: { padding: 16 },
  customerCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatar: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  custName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  custPhone: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 2 },
  custEmail: { fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 8 },
  amountRow: { flexDirection: "row", gap: 24 },
  amtLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginBottom: 2 },
  amtValue: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
