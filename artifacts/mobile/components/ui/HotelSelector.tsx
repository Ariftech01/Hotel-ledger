import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useHotel } from "@/context/HotelContext";

export function HotelSelector() {
  const colors = useColors();
  const { hotels, selectedHotel, selectHotel } = useHotel();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const hotelName = selectedHotel?.name ?? "All Hotels";
  const shortName = hotelName.length > 18 ? hotelName.slice(0, 16) + "…" : hotelName;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.selector,
          {
            backgroundColor: "rgba(255,255,255,0.18)",
            borderRadius: 10,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Feather name="home" size={13} color="rgba(255,255,255,0.85)" />
        <Text style={styles.selectorText} numberOfLines={1}>{shortName}</Text>
        <Feather name="chevron-down" size={13} color="rgba(255,255,255,0.7)" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: Math.max(insets.bottom + 16, 24),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 20,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Select Property</Text>
            <Pressable onPress={() => setOpen(false)} style={[styles.closeBtn, { backgroundColor: colors.muted, borderRadius: 20 }]}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {hotels.map((hotel, idx) => {
              const isSelected = selectedHotel?.id === hotel.id;
              return (
                <Pressable
                  key={hotel.id}
                  onPress={() => { selectHotel(hotel); setOpen(false); }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: isSelected ? colors.accent : pressed ? colors.muted : "transparent",
                      borderRadius: 12,
                      marginHorizontal: 4,
                      marginBottom: 4,
                    },
                  ]}
                >
                  <View style={[styles.hotelBadge, { backgroundColor: isSelected ? colors.primary : colors.muted, borderRadius: 12 }]}>
                    <Feather name="home" size={18} color={isSelected ? "#FFFFFF" : colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.hotelName, { color: isSelected ? colors.primary : colors.text }]}>
                      {hotel.name}
                    </Text>
                    <Text style={[styles.hotelAddr, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {hotel.address}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                      <Feather name="check" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 8, alignSelf: "flex-start" },
  selectorText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#FFFFFF", maxWidth: 140 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sheetTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  closeBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  option: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 12 },
  hotelBadge: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  hotelName: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 2 },
  hotelAddr: { fontFamily: "Inter_400Regular", fontSize: 12 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
