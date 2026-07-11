import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const TAB_ICON_MAP: Record<string, string> = {
  index: "home",
  ledger: "list",
  add: "plus",
  reports: "bar-chart-2",
  settings: "settings",
};

const TAB_LABEL_MAP: Record<string, string> = {
  index: "Dashboard",
  ledger: "Ledger",
  add: "",
  reports: "Reports",
  settings: "Settings",
};

function FABButton() {
  const colors = useColors();
  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/add-transaction");
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: colors.primary,
          transform: [{ scale: pressed ? 0.93 : 1 }],
        },
      ]}
    >
      <Feather name="plus" size={24} color="#FFFFFF" />
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 0 : insets.bottom;
  const tabBarHeight = 64 + bottomPad;

  return (
    <View style={[styles.tabBarContainer, { height: tabBarHeight }]}>
      <View style={[styles.tabBarBg, { backgroundColor: colors.card, borderTopColor: colors.border }]} />
      <View style={[styles.tabBarContent, { paddingBottom: bottomPad }]}>
        {state.routes.map((route: any, index: number) => {
          if (index === 2) return <FABButton key={route.key} />;

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const iconName = TAB_ICON_MAP[route.name] ?? "circle";
          const label = TAB_LABEL_MAP[route.name] ?? route.name;

          const onPress = () => {
            if (!isFocused) {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [styles.tabItem, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={[styles.tabIconWrap, isFocused && { backgroundColor: colors.accent, borderRadius: 10 }]}>
                <Feather
                  name={iconName as any}
                  size={21}
                  color={isFocused ? colors.primary : colors.tabIconDefault}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.primary : colors.tabIconDefault,
                    fontFamily: isFocused ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="ledger" options={{ title: "Ledger" }} />
      <Tabs.Screen name="add" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: { position: "absolute", bottom: 0, left: 0, right: 0 },
  tabBarBg: { ...StyleSheet.absoluteFillObject, borderTopWidth: StyleSheet.hairlineWidth },
  tabBarContent: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingTop: 8 },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  tabIconWrap: { width: 40, height: 32, alignItems: "center", justifyContent: "center" },
  tabLabel: { fontSize: 10 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
});
