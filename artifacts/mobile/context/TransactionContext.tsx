import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";
import { useHotel } from "./HotelContext";
import type { Transaction } from "@/types";

interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id" | "isEdited" | "runningBalance">) => Promise<void>;
  editTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextValue>({
  transactions: [],
  addTransaction: async () => {},
  editTransaction: async () => {},
  deleteTransaction: async () => {},
  isLoading: true,
  refresh: async () => {},
});

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { selectedHotel } = useHotel();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const url = selectedHotel ? `/transactions?hotelId=${selectedHotel.id}` : "/transactions";
      const list = await customFetch<Transaction[]>(url);
      setTransactions(list);
    } catch (err) {
      console.warn("Error fetching transactions list:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedHotel]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (t: Omit<Transaction, "id" | "isEdited" | "runningBalance">) => {
    try {
      const newTx = await customFetch<Transaction>("/transactions", {
        method: "POST",
        body: JSON.stringify({
          ...t,
          hotelId: selectedHotel?.id || user?.hotelId,
        }),
      });
      setTransactions((prev) => [newTx, ...prev]);
    } catch (err: any) {
      throw new Error(err.message || "Failed to create transaction");
    }
  }, [selectedHotel, user]);

  const editTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      const updated = await customFetch<Transaction>(`/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: any) {
      throw new Error(err.message || "Failed to update transaction");
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await customFetch<{ success: boolean }>(`/transactions/${id}`, {
        method: "DELETE",
      });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete transaction");
    }
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        isLoading,
        refresh: fetchTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}
