import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Currency } from "../lib/money";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "LKR",
  setCurrency: () => {},
});

function readSavedCurrency(): Currency {
  try {
    return localStorage.getItem("currency") === "USD" ? "USD" : "LKR";
  } catch {
    return "LKR";
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(readSavedCurrency);

  function setCurrency(next: Currency) {
    setCurrencyState(next);
    try {
      localStorage.setItem("currency", next);
    } catch {
      // localStorage கிடைக்காவிட்டால் பரவாயில்லை
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}