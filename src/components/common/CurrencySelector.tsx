import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useCurrency, Currency } from '../../contexts/CurrencyContext';
import { motion } from 'framer-motion';

const CURRENCIES: { code: Currency; name: string; symbol: string; flag: string }[] = [
  { code: 'XAF', name: 'CFA Franc', symbol: 'FCFA', flag: '🇨🇲' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
];

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 transition-colors"
      >
        <span className="text-base">
          {CURRENCIES.find(c => c.code === currency)?.flag}
        </span>
        <span className="text-xs font-medium">
          {currency}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-ekami-charcoal-800 rounded-xl shadow-lg border border-ekami-silver-200 dark:border-ekami-charcoal-700 z-50"
        >
        <div className="p-2">
          <div className="text-xs font-semibold text-ekami-charcoal-500 dark:text-ekami-silver-500 px-3 py-2">
            Select Currency
          </div>
          {CURRENCIES.map((curr) => (
            <button
              key={curr.code}
              onClick={() => {
                setCurrency(curr.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currency === curr.code
                  ? 'bg-ekami-gold-100 dark:bg-ekami-gold-900/20 text-ekami-gold-700 dark:text-ekami-gold-400'
                  : 'hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700'
              }`}
            >
              <span className="text-xl">{curr.flag}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{curr.code}</div>
                <div className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
                  {curr.name}
                </div>
              </div>
              <span className="text-sm font-semibold">{curr.symbol}</span>
            </button>
          ))}
        </div>
        </motion.div>
      )}
    </div>
  );
}
