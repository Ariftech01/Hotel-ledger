import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MOCK_TRANSACTIONS } from "@/services/mockData";
import type { Transaction } from "@/types";

interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id" | "isEdited" | "runningBalance">) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionContext = createContext<TransactionContextValue>({
  transactions: MOCK_TRANSACTIONS,
  addTransaction: () => {},
  editTransaction: () => {},
  deleteTransaction: () => {},
});

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  useEffect(() => {
    AsyncStorage.getItem("@hlp_transactions").then((stored) => {
      if (stored) {
        try { setTransactions(JSON.parse(stored)); } catch {}
      }
    }).catch(() => {});
  }, []);

  const save = useCallback((list: Transaction[]) => {
    setTransactions(list);
    AsyncStorage.setItem("@hlp_transactions", JSON.stringify(list)).catch(() => {});
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, "id" | "isEdited" | "runningBalance">) => {
    const newT: Transaction = { ...t, id: generateId(), isEdited: false };
    setTransactions((prev) => {
      const next = [newT, ...prev];
      AsyncStorage.setItem("@hlp_transactions", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const editTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, ...updates, isEdited: true, editedAt: new Date().toISOString().split("T")[0] } : t
      );
      AsyncStorage.setItem("@hlp_transactions", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      AsyncStorage.setItem("@hlp_transactions", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, editTransaction, deleteTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}
