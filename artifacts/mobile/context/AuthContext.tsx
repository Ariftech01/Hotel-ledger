import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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

const MOCK_USERS: User[] = [
  { id: "u1", name: "Rajesh Kumar", email: "owner@grandpalace.in", role: "owner", hotelId: "h1" },
  { id: "u2", name: "Priya Sharma", email: "manager@grandpalace.in", role: "manager", hotelId: "h1" },
  { id: "u3", name: "Amit Singh", email: "staff@grandpalace.in", role: "staff", hotelId: "h1" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem("@hlp_user");
        if (stored) setUser(JSON.parse(stored));
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? MOCK_USERS[0];
    await AsyncStorage.setItem("@hlp_user", JSON.stringify(found));
    setUser(found);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("@hlp_user");
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
