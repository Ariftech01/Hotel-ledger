import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MOCK_HOTELS } from "@/services/mockData";
import type { Hotel } from "@/types";

interface HotelContextValue {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  selectHotel: (hotel: Hotel | null) => void;
  isAllHotels: boolean;
}

const HotelContext = createContext<HotelContextValue>({
  hotels: MOCK_HOTELS,
  selectedHotel: MOCK_HOTELS[0] ?? null,
  selectHotel: () => {},
  isAllHotels: false,
});

export function HotelProvider({ children }: { children: React.ReactNode }) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(MOCK_HOTELS[0] ?? null);

  useEffect(() => {
    AsyncStorage.getItem("@hlp_hotel").then((stored) => {
      if (stored) {
        const found = MOCK_HOTELS.find((h) => h.id === stored);
        if (found) setSelectedHotel(found);
      }
    }).catch(() => {});
  }, []);

  const selectHotel = useCallback((hotel: Hotel | null) => {
    setSelectedHotel(hotel);
    if (hotel) {
      AsyncStorage.setItem("@hlp_hotel", hotel.id).catch(() => {});
    } else {
      AsyncStorage.removeItem("@hlp_hotel").catch(() => {});
    }
  }, []);

  return (
    <HotelContext.Provider value={{ hotels: MOCK_HOTELS, selectedHotel, selectHotel, isAllHotels: !selectedHotel }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  return useContext(HotelContext);
}
