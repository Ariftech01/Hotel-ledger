import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ALL_CATEGORIES } from "@/services/mockData";
import type { Category } from "@/types";

interface CategoryContextValue {
  categories: Category[];
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  recentCategoryIds: string[];
  markRecentCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
}

const CategoryContext = createContext<CategoryContextValue>({
  categories: ALL_CATEGORIES,
  addCategory: () => {},
  updateCategory: () => {},
  deleteCategory: () => {},
  recentCategoryIds: [],
  markRecentCategory: () => {},
  getCategoryById: () => undefined,
});

const STORAGE_KEY = "@hlp_categories";
const RECENT_KEY = "@hlp_recent_categories";

function generateId() {
  return "cat_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(ALL_CATEGORIES);
  const [recentCategoryIds, setRecentCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(RECENT_KEY),
    ]).then(([stored, recent]) => {
      if (stored) {
        try { setCategories(JSON.parse(stored)); } catch {}
      }
      if (recent) {
        try { setRecentCategoryIds(JSON.parse(recent)); } catch {}
      }
    }).catch(() => {});
  }, []);

  const save = useCallback((list: Category[]) => {
    setCategories(list);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const addCategory = useCallback((c: Omit<Category, "id">) => {
    const newCat: Category = { ...c, id: generateId() };
    setCategories((prev) => {
      const next = [...prev, newCat];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
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
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, recentCategoryIds, markRecentCategory, getCategoryById }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}
