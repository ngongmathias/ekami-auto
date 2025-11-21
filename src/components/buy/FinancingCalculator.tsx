import { useState, useEffect } from 'react';
import { Calculator, TrendingDown, DollarSign, Calendar, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinancingCalculatorProps {
  carPrice: number;
  onFinanceSelect?: (monthlyPayment: number, downPayment: number, term: number) => void;
}

export default function FinancingCalculator({ carPrice, onFinanceSelect }: FinancingCalculatorProps) {
  const [downPayment, setDownPayment] = useState(carPrice * 0.2); // 20% default
  const [loanTerm, setLoanTerm] = useState(60); // 60 months default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% APR default
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate monthly payment
  useEffect(() => {
    const principal = carPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;

    if (principal <= 0 || monthlyRate <= 0) {
      setMonthlyPayment(0);
      setTotalInterest(0);
      setTotalAmount(downPayment);
      return;
    }

    // Monthly payment formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    const monthly =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const total = monthly * numberOfPayments + downPayment;
    const interest = total - carPrice;

    setMonthlyPayment(monthly);
    setTotalInterest(interest);
    setTotalAmount(total);
  }, [carPrice, downPayment, loanTerm, interestRate]);

  const downPaymentPercent = ((downPayment / carPrice) * 100).toFixed(0);

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-ekami-gold-100 dark:bg-ekami-gold-900/20 rounded-xl">
          <Calculator className="w-6 h-6 text-ekami-gold-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
            Financing Calculator
          </h3>
          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Estimate your monthly payments
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Down Payment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
              Down Payment
            </label>
            <span className="text-sm font-semibold text-ekami-gold-600">
              {downPaymentPercent}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={carPrice}
            step={10000}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 rounded-lg appearance-none cursor-pointer accent-ekami-gold-600"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
              0 XAF
            </span>
            <span className="text-lg font-bold text-ekami-charcoal-900 dark:text-white">
              {downPayment.toLocaleString()} XAF
            </span>
            <span className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
              {carPrice.toLocaleString()} XAF
            </span>
          </div>
        </div>

        {/* Loan Term */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
              Loan Term
            </label>
            <span className="text-sm font-semibold text-ekami-gold-600">
              {loanTerm} months
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[36, 48, 60, 72].map((term) => (
              <button
                key={term}
                onClick={() => setLoanTerm(term)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  loanTerm === term
                    ? 'bg-ekami-gold-600 text-white shadow-md'
                    : 'bg-ekami-silver-100 dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-gold-100 dark:hover:bg-ekami-gold-900/20'
                }`}
              >
                {term}mo
              </button>
            ))}
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
              Interest Rate (APR)
            </label>
            <span className="text-sm font-semibold text-ekami-gold-600">
              {interestRate.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            step={0.5}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 rounded-lg appearance-none cursor-pointer accent-ekami-gold-600"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
              5.0%
            </span>
            <span className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500">
              20.0%
            </span>
          </div>
        </div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-ekami-gold-50 to-ekami-gold-100 dark:from-ekami-gold-900/10 dark:to-ekami-charcoal-800 rounded-2xl border-2 border-ekami-gold-200 dark:border-ekami-gold-800"
        >
          <div className="space-y-4">
            {/* Monthly Payment */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-ekami-gold-600" />
                <span className="text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300">
                  Monthly Payment
                </span>
              </div>
              <span className="text-2xl font-bold text-ekami-gold-600">
                {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF
              </span>
            </div>

            <div className="h-px bg-ekami-gold-200 dark:bg-ekami-gold-800"></div>

            {/* Total Interest */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-ekami-charcoal-500 dark:text-ekami-silver-500" />
                <span className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  Total Interest
                </span>
              </div>
              <span className="text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                {totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF
              </span>
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-ekami-charcoal-500 dark:text-ekami-silver-500" />
                <span className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  Total Amount
                </span>
              </div>
              <span className="text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                {totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF
              </span>
            </div>
          </div>
        </motion.div>

        {/* Apply Button */}
        {onFinanceSelect && (
          <button
            onClick={() => onFinanceSelect(monthlyPayment, downPayment, loanTerm)}
            className="w-full py-3 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <TrendingDown className="w-5 h-5" />
            Apply for Financing
          </button>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 text-center">
          * Rates and terms are estimates. Final approval subject to credit check.
        </p>
      </div>
    </div>
  );
}
