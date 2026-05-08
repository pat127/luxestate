'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Currency = 'AED' | 'USD' | 'GBP' | 'EUR';

export interface CurrencyOption {
  code: Currency;
  symbol: string;
  label: string;
  rate: number; // rate relative to AED (1 AED = X currency)
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham', rate: 1 },
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 0.2723 },
  { code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.2148 },
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.2499 },
];

const CURRENCY_STORAGE_KEY = 'preferred_currency';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencyOption: CurrencyOption;
  formatPrice: (aedPrice: string) => string;
  convertAmount: (aedAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'AED',
  setCurrency: () => {},
  currencyOption: CURRENCIES[0],
  formatPrice: (p) => p,
  convertAmount: (a) => a,
});

export function CurrencyProvider({ children, defaultCurrency = 'AED' }: { children: React.ReactNode; defaultCurrency?: Currency }) {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    if (defaultCurrency !== 'AED') return; // don't override page-level defaults
    try {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
      if (stored && CURRENCIES.find((c) => c.code === stored)) {
        setCurrencyState(stored);
      }
    } catch {
      // no-op
    }
  }, [defaultCurrency]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    } catch {
      // no-op
    }
  }, []);

  const currencyOption = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  const convertAmount = useCallback((aedAmount: number): number => {
    return aedAmount * currencyOption.rate;
  }, [currencyOption]);

  const formatPrice = useCallback((aedPrice: string): string => {
    if (currency === 'AED') return aedPrice;

    // Extract numeric value from price string like "AED 1,200,000" or "AED 1.2M+" or "$28,500,000"
    const cleaned = aedPrice.replace(/[^0-9.KMBkm+]/g, '');
    let numericValue = 0;

    if (cleaned.includes('M') || cleaned.includes('m')) {
      numericValue = parseFloat(cleaned) * 1_000_000;
    } else if (cleaned.includes('B') || cleaned.includes('b')) {
      numericValue = parseFloat(cleaned) * 1_000_000_000;
    } else if (cleaned.includes('K') || cleaned.includes('k')) {
      numericValue = parseFloat(cleaned) * 1_000;
    } else {
      numericValue = parseFloat(cleaned.replace(/,/g, ''));
    }

    if (isNaN(numericValue) || numericValue === 0) return aedPrice;

    // If original was in USD (starts with $), convert to AED first
    if (aedPrice.trim().startsWith('$')) {
      numericValue = numericValue / 0.2723; // USD to AED
    }

    const converted = numericValue * currencyOption.rate;
    const hasPlus = aedPrice.includes('+');

    // Format the converted value
    let formatted: string;
    if (converted >= 1_000_000) {
      formatted = `${currencyOption.symbol}${(converted / 1_000_000).toFixed(1)}M`;
    } else if (converted >= 1_000) {
      formatted = `${currencyOption.symbol}${Math.round(converted / 1_000)}K`;
    } else {
      formatted = `${currencyOption.symbol}${Math.round(converted).toLocaleString()}`;
    }

    return hasPlus ? `${formatted}+` : formatted;
  }, [currency, currencyOption]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencyOption, formatPrice, convertAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
