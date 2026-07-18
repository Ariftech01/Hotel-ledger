import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize API base URL and auth token getter once on startup
  useEffect(() => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
    setBaseUrl(apiUrl ? `${apiUrl}/api` : "");

    setAuthTokenGetter(async () => {
      const storedToken = await AsyncStorage.getItem("@hlp_token");
      if (storedToken) return storedToken;

      const { data } = await supabase.auth.getSession();
      return data.session?.access_token || null;
    });

    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("@hlp_token");
        if (storedToken && storedToken.startsWith("demo-token-")) {
          const storedUser = await AsyncStorage.getItem("@hlp_user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsLoading(false);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const stored = await AsyncStorage.getItem("@hlp_user");
          if (stored) {
            setUser(JSON.parse(stored));
          } else {
            // Fetch live profile from backend using standard fetch (bypass cached user)
            const response = await fetch(`${apiUrl}/api/profile`, {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });
            if (response.ok) {
              const profile = await response.json();
              await AsyncStorage.setItem("@hlp_user", JSON.stringify(profile));
              setUser(profile);
            }
          }
        }
      } catch (err) {
        console.warn("Restore session error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      const storedToken = await AsyncStorage.getItem("@hlp_token");
      if (storedToken && storedToken.startsWith("demo-token-")) {
        return;
      }

      if (session) {
        try {
          const response = await fetch(`${apiUrl}/api/profile`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (response.ok) {
            const profile = await response.json();
            await AsyncStorage.setItem("@hlp_user", JSON.stringify(profile));
            setUser(profile);
          }
        } catch {
          setUser(null);
        }
      } else {
        await AsyncStorage.removeItem("@hlp_user");
        await AsyncStorage.removeItem("@hlp_token");
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Invalid credentials");
    }

    const res = await response.json();

    // Set the supabase session
    if (!res.token.startsWith("demo-token-")) {
      const { error } = await supabase.auth.setSession({
        access_token: res.token,
        refresh_token: res.refreshToken,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    await AsyncStorage.setItem("@hlp_user", JSON.stringify(res.user));
    await AsyncStorage.setItem("@hlp_token", res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
    const storedToken = await AsyncStorage.getItem("@hlp_token");

    if (storedToken && storedToken.startsWith("demo-token-")) {
      await AsyncStorage.removeItem("@hlp_user");
      await AsyncStorage.removeItem("@hlp_token");
      setUser(null);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    }
    await supabase.auth.signOut();
    await AsyncStorage.removeItem("@hlp_user");
    await AsyncStorage.removeItem("@hlp_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
