'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type Currency = 'AED' | 'USD' | 'GBP' | 'EUR';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (aedAmount: number) => string;
  convertPrice: (priceStr: string) => string;
}

// Approximate exchange rates from AED
const RATES: Record<Currency, number> = {
  AED: 1,
  USD: 0.2723,
  GBP: 0.2147,
  EUR: 0.2501,
};

const SYMBOLS: Record<Currency, string> = {
  AED: 'AED ',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'AED',
  setCurrency: () => {},
  format: (n) => `AED ${n.toLocaleString()}`,
  convertPrice: (s) => s,
});

export function CurrencyProvider({
  children,
  defaultCurrency = 'AED',
}: {
  children: React.ReactNode;
  defaultCurrency?: Currency;
}) {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
  }, []);

  const format = useCallback(
    (aedAmount: number): string => {
      const converted = aedAmount * RATES[currency];
      return `${SYMBOLS[currency]}${Math.round(converted).toLocaleString()}`;
    },
    [currency]
  );

  // Convert a price string like "AED 1,200,000" or "AED 1.2M+" to the selected currency
  const convertPrice = useCallback(
    (priceStr: string): string => {
      if (!priceStr || priceStr === 'TBD') return priceStr;

      // Try to parse AED amount from string
      const cleanStr = priceStr.replace(/,/g, '');

      // Match patterns like "AED 1200000", "AED 1.2M+", "From AED 1.2M"
      const aedMatch = cleanStr.match(/AED\s*([\d.]+)([MmKk]?)\+?/i);
      if (aedMatch) {
        let amount = parseFloat(aedMatch[1]);
        const suffix = aedMatch[2].toUpperCase();
        if (suffix === 'M') amount *= 1_000_000;
        else if (suffix === 'K') amount *= 1_000;

        const prefix = priceStr.toLowerCase().includes('from') ? 'From ' : '';
        const hasSuffix = priceStr.includes('+');
        return `${prefix}${format(amount)}${hasSuffix ? '+' : ''}`;
      }

      // Try plain number (no currency prefix)
      const plainMatch = cleanStr.match(/^([\d.]+)([MmKk]?)$/);
      if (plainMatch) {
        let amount = parseFloat(plainMatch[1]);
        const suffix = plainMatch[2].toUpperCase();
        if (suffix === 'M') amount *= 1_000_000;
        else if (suffix === 'K') amount *= 1_000;
        return format(amount);
      }

      // If already in another currency or unrecognised, return as-is
      return priceStr;
    },
    [currency, format]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export { RATES, SYMBOLS };
