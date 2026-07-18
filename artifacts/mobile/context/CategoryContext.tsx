import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";
import { useHotel } from "./HotelContext";
import type { Category } from "@/types";

interface CategoryContextValue {
  categories: Category[];
  addCategory: (c: Omit<Category, "id">) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  recentCategoryIds: string[];
  markRecentCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextValue>({
  categories: [],
  addCategory: async () => ({} as Category),
  updateCategory: async () => {},
  deleteCategory: async () => {},
  recentCategoryIds: [],
  markRecentCategory: () => {},
  getCategoryById: () => undefined,
  isLoading: true,
  refresh: async () => {},
});

const RECENT_KEY = "@hlp_recent_categories";

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { selectedHotel } = useHotel();
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentCategoryIds, setRecentCategoryIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const url = selectedHotel ? `/categories?hotelId=${selectedHotel.id}` : "/categories";
      const list = await customFetch<Category[]>(url);
      setCategories(list);
    } catch (err) {
      console.warn("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedHotel]);

  useEffect(() => {
    fetchCategories();

    // Restore recent categories from local storage
    AsyncStorage.getItem(RECENT_KEY).then((recent) => {
      if (recent) {
        try { setRecentCategoryIds(JSON.parse(recent)); } catch {}
      }
    }).catch(() => {});
  }, [fetchCategories]);

  const addCategory = useCallback(async (c: Omit<Category, "id">) => {
    try {
      const payload = {
        ...c,
        hotelId: c.hotelId || selectedHotel?.id || user?.hotelId,
      };
      const newCat = await customFetch<Category>("/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    } catch (err: any) {
      throw new Error(err.message || "Failed to add category");
    }
  }, [selectedHotel, user]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    try {
      const updated = await customFetch<Category>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: any) {
      throw new Error(err.message || "Failed to update category");
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await customFetch<{ success: boolean }>(`/categories/${id}`, {
        method: "DELETE",
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete category");
    }
  }, []);

  const markRecentCategory = useCallback((id: string) => {
    setRecentCategoryIds((prev) => {
      const filtered = prev.filter((x) => x !== id);
      const next = [id, ...filtered].slice(0, 8);
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const getCategoryById = useCallback((id: string) => {
    return categories.find((c) => c.id === id);
  }, [categories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        recentCategoryIds,
        markRecentCategory,
        getCategoryById,
        isLoading,
        refresh: fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}
