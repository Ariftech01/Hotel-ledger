import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useHotel } from "@/context/HotelContext";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { selectedHotel } = useHotel();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);

  const roleLabel = user?.role === "owner" ? "Owner" : user?.role === "manager" ? "Manager" : "Staff";
  const roleColor = user?.role === "owner" ? colors.warning : user?.role === "manager" ? colors.primary : colors.secondary;

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.profileSection}>
          <View style={[styles.avatarLarge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="user" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.name}>{user?.name ?? "User"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={[styles.rolePill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="shield" size={12} color="#FFFFFF" />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Account Details</Text>
          {[
            { label: "Full Name", value: user?.name ?? "-", icon: "user" },
            { label: "Email", value: user?.email ?? "-", icon: "mail" },
            { label: "Role", value: roleLabel, icon: "shield", color: roleColor },
            { label: "Hotel", value: selectedHotel?.name ?? "All Properties", icon: "home" },
          ].map((item) => (
            <View key={item.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.muted, borderRadius: 8 }]}>
                <Feather name={item.icon as any} size={16} color={item.color ?? colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: item.color ?? colors.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Permissions</Text>
          {[
            { label: "View Transactions", allowed: true },
            { label: "Add Transactions", allowed: true },
            { label: "Edit Transactions", allowed: user?.role !== "staff" },
            { label: "Delete Transactions", allowed: user?.role !== "staff" },
            { label: "View Reports", allowed: user?.role !== "staff" },
            { label: "Manage Categories", allowed: user?.role === "owner" },
            { label: "User Management", allowed: user?.role === "owner" },
            { label: "Settings", allowed: user?.role === "owner" },
          ].map((perm) => (
            <View key={perm.label} style={[styles.permRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.permLabel, { color: colors.textSecondary }]}>{perm.label}</Text>
              <View style={[styles.permBadge, { backgroundColor: perm.allowed ? colors.successLight : colors.dangerLight }]}>
                <Feather name={perm.allowed ? "check" : "x"} size={12} color={perm.allowed ? colors.success : colors.danger} />
                <Text style={[styles.permText, { color: perm.allowed ? colors.success : colors.danger }]}>
                  {perm.allowed ? "Allowed" : "Restricted"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Security</Text>
          {[
            { label: "Change Password", icon: "lock" },
            { label: "Two-Factor Authentication", icon: "shield" },
            { label: "Active Sessions", icon: "monitor" },
          ].map((item) => (
            <Pressable key={item.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.muted, borderRadius: 8 }]}>
                <Feather name={item.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.infoValue, { color: colors.text, flex: 1 }]}>{item.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 36 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  profileSection: { alignItems: "center", gap: 10 },
  avatarLarge: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  name: { fontFamily: "Inter_700Bold", fontSize: 24, color: "#FFFFFF" },
  email: { fontFamily: "Inter_400Regular", fontSize: 15, color: "rgba(255,255,255,0.8)" },
  rolePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, marginTop: 4 },
  roleText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#FFFFFF" },
  infoCard: { borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, overflow: "hidden" },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 16, padding: 16, paddingBottom: 0 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  infoIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 2 },
  infoValue: { fontFamily: "Inter_500Medium", fontSize: 14 },
  permRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  permLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  permBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  permText: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
