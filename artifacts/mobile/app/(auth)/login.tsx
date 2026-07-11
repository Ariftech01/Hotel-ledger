import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

const DEMO_ACCOUNTS = [
  { label: "Owner", email: "owner@grandpalace.in", icon: "shield", color: "#F59E0B" },
  { label: "Manager", email: "manager@grandpalace.in", icon: "briefcase", color: "#1E40AF" },
  { label: "Staff", email: "staff@grandpalace.in", icon: "user", color: "#059669" },
];

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("owner@grandpalace.in");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      shake();
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      setError("Invalid credentials. Please try again.");
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.primary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 36 }]}>
        <View style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Feather name="book-open" size={26} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.appName}>Hotel Ledger Pro</Text>
            <Text style={styles.appTagline}>Premium Hotel Accounting</Text>
          </View>
        </View>
        <View style={styles.headerBadge}>
          <View style={[styles.badgeDot, { backgroundColor: "#6EE7B7" }]} />
          <Text style={styles.badgeText}>India's #1 Hotel Accounting App</Text>
        </View>
      </View>

      {/* Card */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.background,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                paddingBottom: Math.max(insets.bottom + 32, 40),
              },
            ]}
          >
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.welcomeSub, { color: colors.mutedForeground }]}>
              Sign in to manage your property finances
            </Text>

            {/* Error */}
            {error.length > 0 && (
              <Animated.View
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.dangerLight, borderRadius: 12, transform: [{ translateX: shakeAnim }] },
                ]}
              >
                <Feather name="alert-circle" size={16} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </Animated.View>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.card,
                    borderColor: emailFocused ? colors.primary : colors.border,
                    borderRadius: 14,
                    shadowColor: emailFocused ? colors.primary : "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                  },
                ]}
              >
                <Feather name="mail" size={17} color={emailFocused ? colors.primary : colors.textTertiary} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="yourname@hotel.com"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.textInput, { color: colors.text }]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
                <Pressable>
                  <Text style={[styles.forgotLink, { color: colors.primary }]}>Forgot?</Text>
                </Pressable>
              </View>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.card,
                    borderColor: passwordFocused ? colors.primary : colors.border,
                    borderRadius: 14,
                    shadowColor: passwordFocused ? colors.primary : "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                  },
                ]}
              >
                <Feather name="lock" size={17} color={passwordFocused ? colors.primary : colors.textTertiary} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.textInput, { color: colors.text }]}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={17} color={colors.textTertiary} />
                </Pressable>
              </View>
            </View>

            {/* Sign In Button */}
            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            />

            {/* Divider */}
            <View style={styles.divRow}>
              <View style={[styles.divLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.divLabel, { color: colors.textTertiary }]}>Quick Demo Access</Text>
              <View style={[styles.divLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Demo accounts */}
            <View style={styles.demoGrid}>
              {DEMO_ACCOUNTS.map((demo) => (
                <Pressable
                  key={demo.email}
                  onPress={() => { setEmail(demo.email); setPassword("password123"); setError(""); }}
                  style={({ pressed }) => [
                    styles.demoCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: email === demo.email ? demo.color : colors.border,
                      borderRadius: 12,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View style={[styles.demoIcon, { backgroundColor: demo.color + "18", borderRadius: 8 }]}>
                    <Feather name={demo.icon as any} size={16} color={demo.color} />
                  </View>
                  <Text style={[styles.demoLabel, { color: colors.textSecondary }]}>{demo.label}</Text>
                  {email === demo.email && (
                    <View style={[styles.selectedDot, { backgroundColor: demo.color }]} />
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={[styles.footerNote, { color: colors.textTertiary }]}>
              Password is ignored for demo accounts
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 36 },
  logoArea: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  logoBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  appName: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF" },
  appTagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 100, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "rgba(255,255,255,0.9)" },
  card: { flex: 1, padding: 28 },
  welcomeTitle: { fontFamily: "Inter_700Bold", fontSize: 28, marginBottom: 6 },
  welcomeSub: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22, marginBottom: 28 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, marginBottom: 20 },
  errorText: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  inputLabel: { fontFamily: "Inter_500Medium", fontSize: 14, marginBottom: 8 },
  forgotLink: { fontFamily: "Inter_500Medium", fontSize: 13 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, height: 54, borderWidth: 1.5 },
  textInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  divRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 32, marginBottom: 20 },
  divLine: { flex: 1, height: 1 },
  divLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  demoGrid: { flexDirection: "row", gap: 10 },
  demoCard: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 8, borderWidth: 1.5, gap: 8 },
  demoIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  demoLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  selectedDot: { width: 6, height: 6, borderRadius: 3 },
  footerNote: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center", marginTop: 16 },
});
