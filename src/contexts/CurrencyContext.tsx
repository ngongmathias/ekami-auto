import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'XAF' | 'USD' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInXAF: number) => number;
  formatPrice: (priceInXAF: number) => string;
  exchangeRates: Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (XAF as base)
// These should ideally come from an API in production
const EXCHANGE_RATES: Record<Currency, number> = {
  XAF: 1,
  USD: 0.0016, // 1 USD ≈ 625 XAF
  EUR: 0.0015, // 1 EUR ≈ 670 XAF
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  XAF: 'FCFA',
  USD: '$',
  EUR: '€',
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Load from localStorage or default to XAF
    const saved = localStorage.getItem('preferred_currency');
    return (saved as Currency) || 'XAF';
  });

  useEffect(() => {
    // Save to localStorage whenever currency changes
    localStorage.setItem('preferred_currency', currency);
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const convertPrice = (priceInXAF: number): number => {
    const rate = EXCHANGE_RATES[currency];
    return priceInXAF * rate;
  };

  const formatPrice = (priceInXAF: number): string => {
    const convertedPrice = convertPrice(priceInXAF);
    const symbol = CURRENCY_SYMBOLS[currency];

    // Format based on currency
    if (currency === 'XAF') {
      return `${Math.round(convertedPrice).toLocaleString()} ${symbol}`;
    } else if (currency === 'USD') {
      return `${symbol}${convertedPrice.toFixed(2)}`;
    } else {
      return `${symbol}${convertedPrice.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        exchangeRates: EXCHANGE_RATES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
