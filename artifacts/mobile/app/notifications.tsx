import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_NOTIFICATIONS } from "@/services/mockData";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Notification } from "@/types";

const TYPE_ICONS: Record<string, string> = {
  payment_received: "check-circle",
  invoice_sent: "file-text",
  reminder: "clock",
  pending_bill: "alert-circle",
  system: "info",
};

const TYPE_COLORS: Record<string, string> = {
  payment_received: "#059669",
  invoice_sent: "#1E40AF",
  reminder: "#F59E0B",
  pending_bill: "#EF4444",
  system: "#6B7280",
};

function NotifCard({ item, onPress }: { item: Notification; onPress: () => void }) {
  const colors = useColors();
  const iconColor = TYPE_COLORS[item.type] ?? colors.primary;
  const now = new Date();
  const created = new Date(item.createdAt);
  const diffHrs = Math.floor((now.getTime() - created.getTime()) / 3600000);
  const timeAgo = diffHrs < 1 ? "Just now" : diffHrs < 24 ? `${diffHrs}h ago` : `${Math.floor(diffHrs / 24)}d ago`;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.notifCard, {
        backgroundColor: item.isRead ? colors.card : colors.accent,
        borderLeftColor: iconColor,
        borderRadius: colors.radius,
        marginHorizontal: 16,
        marginVertical: 4,
      }]}
    >
      <View style={[styles.notifIcon, { backgroundColor: iconColor + "20", borderRadius: 20 }]}>
        <Feather name={(TYPE_ICONS[item.type] ?? "bell") as any} size={18} color={iconColor} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifTitleRow}>
          <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
          {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>{item.message}</Text>
        <Text style={[styles.notifTime, { color: colors.textTertiary }]}>{timeAgo}</Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{unreadCount} unread</Text>}
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead}>
            <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotifCard item={item} onPress={() => setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, isRead: true } : n))} />
        )}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        ListEmptyComponent={<EmptyState icon="bell-off" title="No Notifications" description="You're all caught up!" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13 },
  markAll: { fontFamily: "Inter_500Medium", fontSize: 14 },
  notifCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16, borderLeftWidth: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  notifIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  notifTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifMessage: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, marginBottom: 6 },
  notifTime: { fontFamily: "Inter_400Regular", fontSize: 11 },
});
