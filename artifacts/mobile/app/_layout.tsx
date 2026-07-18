import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { CategoryProvider } from "@/context/CategoryContext";
import { HotelProvider } from "@/context/HotelContext";
import { TransactionProvider } from "@/context/TransactionContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-transaction"
        options={{ presentation: "modal", headerShown: false, gestureEnabled: true }}
      />
      <Stack.Screen
        name="edit-transaction"
        options={{ presentation: "modal", headerShown: false, gestureEnabled: true }}
      />
      <Stack.Screen
        name="report-export"
        options={{ presentation: "modal", headerShown: false, gestureEnabled: true }}
      />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
      <Stack.Screen name="customers" options={{ headerShown: false }} />
      <Stack.Screen name="vendors" options={{ headerShown: false }} />
      <Stack.Screen name="invoice/index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const apiMissing = !process.env.EXPO_PUBLIC_API_URL;
  const supabaseUrlMissing = !process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKeyMissing = !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (fontsLoaded || fontError || apiMissing || supabaseUrlMissing || supabaseKeyMissing) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, apiMissing, supabaseUrlMissing, supabaseKeyMissing]);

  if (!fontsLoaded && !fontError) return null;

  if (apiMissing || supabaseUrlMissing || supabaseKeyMissing) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#F8FAFC" }}>
          <View style={{ backgroundColor: "#FEE2E2", width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ color: "#EF4444", fontSize: 28, fontWeight: "bold" }}>!</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#0F172A", marginBottom: 8, textAlign: "center" }}>
            Configuration Required
          </Text>
          <Text style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 24, paddingHorizontal: 16, lineHeight: 20 }}>
            Please set the following environment variables in your .env file to run the mobile application:
          </Text>
          <View style={{ width: "100%", maxWidth: 320, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", padding: 16, gap: 12 }}>
            {apiMissing && (
              <Text style={{ fontSize: 13, fontFamily: "monospace", color: "#EF4444" }}>
                ❌ EXPO_PUBLIC_API_URL
              </Text>
            )}
            {supabaseUrlMissing && (
              <Text style={{ fontSize: 13, fontFamily: "monospace", color: "#EF4444" }}>
                ❌ EXPO_PUBLIC_SUPABASE_URL
              </Text>
            )}
            {supabaseKeyMissing && (
              <Text style={{ fontSize: 13, fontFamily: "monospace", color: "#EF4444" }}>
                ❌ EXPO_PUBLIC_SUPABASE_ANON_KEY
              </Text>
            )}
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <HotelProvider>
              <CategoryProvider>
                <TransactionProvider>
                  <RootLayoutNav />
                </TransactionProvider>
              </CategoryProvider>
            </HotelProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
