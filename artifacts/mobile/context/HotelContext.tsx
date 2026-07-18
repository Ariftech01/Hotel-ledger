import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";
import type { Hotel } from "@/types";

interface HotelContextValue {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  selectHotel: (hotel: Hotel | null) => void;
  isAllHotels: boolean;
  isLoading: boolean;
}

const HotelContext = createContext<HotelContextValue>({
  hotels: [],
  selectedHotel: null,
  selectHotel: () => {},
  isAllHotels: true,
  isLoading: true,
});

export function HotelProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHotels = useCallback(async () => {
    if (!user) {
      setHotels([]);
      setSelectedHotel(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await customFetch<Hotel[]>("/hotels");
      setHotels(list);

      const stored = await AsyncStorage.getItem("@hlp_hotel");
      if (stored) {
        const found = list.find((h: Hotel) => h.id === stored);
        if (found) {
          setSelectedHotel(found);
          setIsLoading(false);
          return;
        }
      }

      // Default scoping logic
      if (user.role !== "owner") {
        const assigned = list.find((h: Hotel) => h.id === user.hotelId);
        setSelectedHotel(assigned || list[0] || null);
      } else {
        setSelectedHotel(list[0] || null);
      }
    } catch (err) {
      console.warn("Error fetching hotels list:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const selectHotel = useCallback((hotel: Hotel | null) => {
    if (user && user.role !== "owner" && hotel && hotel.id !== user.hotelId) {
      // Force non-owners to view their assigned hotel property only
      return;
    }
    setSelectedHotel(hotel);
    if (hotel) {
      AsyncStorage.setItem("@hlp_hotel", hotel.id).catch(() => {});
    } else {
      AsyncStorage.removeItem("@hlp_hotel").catch(() => {});
    }
  }, [user]);

  return (
    <HotelContext.Provider value={{ hotels, selectedHotel, selectHotel, isAllHotels: !selectedHotel, isLoading }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  return useContext(HotelContext);
}
