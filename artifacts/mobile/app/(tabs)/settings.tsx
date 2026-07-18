import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

interface SettingRowProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  danger?: boolean;
  showChevron?: boolean;
}

function SettingRow({ icon, label, sublabel, onPress, rightElement, iconBg, iconColor, danger, showChevron = true }: SettingRowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.muted : "transparent", borderBottomColor: colors.border },
      ]}
    >
      <View style={[styles.rowIconWrap, { backgroundColor: iconBg ?? colors.muted, borderRadius: 10 }]}>
        <Feather name={icon as any} size={17} color={iconColor ?? colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
        {sublabel && <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{sublabel}</Text>}
      </View>
      {rightElement !== undefined
        ? rightElement
        : showChevron && <Feather name="chevron-right" size={16} color={colors.textTertiary} />
      }
    </Pressable>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  const colors = useColors();
  return (
    <View style={styles.sectionWrap}>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPad = insets.top + 16;

  const handleLogout = () => {
    if (Platform.OS === "web") { logout(); router.replace("/(auth)/login"); return; }
    Alert.alert("Sign Out", "You'll need to sign in again to access your account.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await logout(); router.replace("/(auth)/login"); } },
    ]);
  };

  const roleLabel = user?.role === "owner" ? "Owner" : user?.role === "manager" ? "Manager" : "Staff";
  const roleColor = user?.role === "owner" ? colors.warning : user?.role === "manager" ? colors.primary : colors.secondary;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      {/* Profile Card */}
      <Pressable
        onPress={() => router.push("/profile")}
        style={({ pressed }) => [
          styles.profileCard,
          { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <View style={styles.profileAvatarWrap}>
          <View style={styles.profileAvatar}>
            <Feather name="user" size={26} color="#FFFFFF" />
          </View>
          <View style={[styles.profileOnline, { backgroundColor: "#10B981", borderColor: colors.primary }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.name ?? "User"}</Text>
          <Text style={styles.profileEmail} numberOfLines={1}>{user?.email}</Text>
          <View style={[styles.rolePill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="shield" size={11} color="rgba(255,255,255,0.9)" />
            <Text style={styles.rolePillText}>{roleLabel} Access</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
      </Pressable>

      {/* Property */}
      <Section title="Property">
        <SettingRow icon="home" label="Hotels & Branches" sublabel="Manage your properties" iconBg={colors.accent} iconColor={colors.primary} onPress={() => {}} />
        <SettingRow icon="users" label="Customers" sublabel="Manage customer accounts" iconBg={colors.successLight} iconColor={colors.secondary} onPress={() => router.push("/customers")} />
        <SettingRow icon="briefcase" label="Vendors" sublabel="Manage vendor accounts" iconBg="#EDE9FE" iconColor="#7C3AED" onPress={() => router.push("/vendors")} showChevron />
      </Section>

      {/* Finance */}
      <Section title="Finance">
        <SettingRow icon="grid" label="Categories" sublabel="Income & expense categories" iconBg="#CFFAFE" iconColor="#0891B2" onPress={() => router.push("/categories")} />
        <SettingRow icon="credit-card" label="Payment Methods" sublabel="Cash, UPI, Bank Transfer…" iconBg={colors.warningLight} iconColor={colors.warning} onPress={() => {}} />
        <SettingRow icon="file-text" label="Invoices & GST" sublabel="Manage GST invoices" iconBg="#FEF3C7" iconColor="#D97706" onPress={() => router.push("/invoice/index" as any)} />
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <SettingRow
          icon="moon"
          label="Dark Mode"
          sublabel="Switch to dark theme"
          iconBg={colors.muted}
          iconColor={colors.textSecondary}
          showChevron={false}
          rightElement={
            <Switch
              value={false}
              onValueChange={() => { if (Platform.OS !== "web") Haptics.selectionAsync(); }}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <SettingRow icon="bell" label="Notifications" sublabel="Reminders & alerts" iconBg="#EDE9FE" iconColor="#7C3AED" onPress={() => router.push("/notifications")} />
        <SettingRow icon="globe" label="Language" sublabel="English" iconBg={colors.muted} iconColor={colors.textSecondary} onPress={() => {}} />
      </Section>

      {/* Security & Data */}
      <Section title="Security & Data">
        <SettingRow icon="lock" label="Security" sublabel="PIN lock, biometric" iconBg={colors.dangerLight} iconColor={colors.danger} onPress={() => {}} />
        <SettingRow icon="database" label="Backup & Restore" sublabel="Cloud sync settings" iconBg={colors.accent} iconColor={colors.primary} onPress={() => {}} />
      </Section>

      {/* About */}
      <Section title="About">
        <SettingRow icon="info" label="About Hotel Ledger Pro" sublabel="Version 1.0.0 (Build 100)" iconBg={colors.muted} iconColor={colors.mutedForeground} onPress={() => {}} />
        <SettingRow icon="shield" label="Privacy Policy" iconBg={colors.muted} iconColor={colors.mutedForeground} onPress={() => {}} />
        <SettingRow icon="file" label="Terms of Service" iconBg={colors.muted} iconColor={colors.mutedForeground} onPress={() => {}} showChevron />
      </Section>

      {/* Logout */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { backgroundColor: colors.dangerLight, borderRadius: 16, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, marginHorizontal: 16, marginTop: 20, marginBottom: 8, borderRadius: 20, padding: 20, shadowColor: "#1E40AF", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  profileAvatarWrap: { position: "relative" },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  profileOnline: { position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF", marginBottom: 3 },
  profileEmail: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 10 },
  rolePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, alignSelf: "flex-start" },
  rolePillText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#FFFFFF" },
  sectionWrap: { paddingHorizontal: 16, marginTop: 24 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.8, marginBottom: 8 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIconWrap: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontFamily: "Inter_500Medium", fontSize: 15 },
  rowSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
});
