import { useState, useEffect } from 'react';
import { Calculator, TrendingDown, Calendar, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinancingCalculatorProps {
  carPrice: number;
  carName?: string;
}

export default function FinancingCalculator({ carPrice, carName }: FinancingCalculatorProps) {
  const [downPayment, setDownPayment] = useState(carPrice * 0.2); // 20% default
  const [loanTerm, setLoanTerm] = useState(48); // 48 months default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% default
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Calculate monthly payment
  useEffect(() => {
    const principal = carPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;

    if (principal <= 0 || monthlyRate === 0) {
      setMonthlyPayment(0);
      setTotalInterest(0);
      setTotalCost(carPrice);
      return;
    }

    // Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthly =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const total = monthly * numberOfPayments + downPayment;
    const interest = total - carPrice;

    setMonthlyPayment(monthly);
    setTotalInterest(interest);
    setTotalCost(total);
  }, [carPrice, downPayment, loanTerm, interestRate]);

  const downPaymentPercentage = ((downPayment / carPrice) * 100).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-ekami-gold-50 to-white dark:from-ekami-charcoal-800 dark:to-ekami-charcoal-900 rounded-2xl p-6 border-2 border-ekami-gold-200 dark:border-ekami-gold-800"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-ekami-gold-600 rounded-xl">
          <Calculator className="w-6 h-6 text-white" />
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

      {/* Car Price Display */}
      <div className="mb-6 p-4 bg-white dark:bg-ekami-charcoal-800 rounded-xl border border-ekami-silver-200 dark:border-ekami-charcoal-700">
        <div className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-1">
          Vehicle Price
        </div>
        <div className="text-2xl font-bold text-ekami-gold-600">
          {carPrice.toLocaleString()} XAF
        </div>
        {carName && (
          <div className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
            {carName}
          </div>
        )}
      </div>

      {/* Down Payment Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Down Payment
          </label>
          <div className="text-sm font-bold text-ekami-gold-600">
            {downPayment.toLocaleString()} XAF ({downPaymentPercentage}%)
          </div>
        </div>
        <input
          type="range"
          min={carPrice * 0.1}
          max={carPrice * 0.5}
          step={carPrice * 0.01}
          value={downPayment}
          onChange={(e) => setDownPayment(Number(e.target.value))}
          className="w-full h-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 rounded-lg appearance-none cursor-pointer accent-ekami-gold-600"
        />
        <div className="flex justify-between text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
          <span>10%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Loan Term Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Loan Term
          </label>
          <div className="text-sm font-bold text-ekami-gold-600">
            {loanTerm} months ({(loanTerm / 12).toFixed(1)} years)
          </div>
        </div>
        <input
          type="range"
          min={12}
          max={84}
          step={12}
          value={loanTerm}
          onChange={(e) => setLoanTerm(Number(e.target.value))}
          className="w-full h-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 rounded-lg appearance-none cursor-pointer accent-ekami-gold-600"
        />
        <div className="flex justify-between text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
          <span>1 year</span>
          <span>7 years</span>
        </div>
      </div>

      {/* Interest Rate Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Interest Rate
          </label>
          <div className="text-sm font-bold text-ekami-gold-600">
            {interestRate.toFixed(1)}% APR
          </div>
        </div>
        <input
          type="range"
          min={3}
          max={15}
          step={0.5}
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          className="w-full h-2 bg-ekami-silver-200 dark:bg-ekami-charcoal-700 rounded-lg appearance-none cursor-pointer accent-ekami-gold-600"
        />
        <div className="flex justify-between text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
          <span>3%</span>
          <span>15%</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3 pt-6 border-t-2 border-ekami-gold-200 dark:border-ekami-gold-800">
        {/* Monthly Payment - Highlighted */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="p-4 bg-ekami-gold-600 rounded-xl text-white"
        >
          <div className="text-sm font-medium mb-1">Estimated Monthly Payment</div>
          <div className="text-3xl font-bold">
            {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF
          </div>
          <div className="text-xs opacity-90 mt-1">per month for {loanTerm} months</div>
        </motion.div>

        {/* Total Interest */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-ekami-charcoal-800 rounded-xl border border-ekami-silver-200 dark:border-ekami-charcoal-700">
          <span className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Total Interest
          </span>
          <span className="font-bold text-ekami-charcoal-900 dark:text-white">
            {totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF
          </span>
        </div>

        {/* Total Cost */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-ekami-charcoal-800 rounded-xl border border-ekami-silver-200 dark:border-ekami-charcoal-700">
          <span className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Total Cost
          </span>
          <span className="font-bold text-ekami-charcoal-900 dark:text-white">
            {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 rounded-xl">
        <p className="text-xs text-ekami-charcoal-600 dark:text-ekami-silver-400 leading-relaxed">
          <strong>Note:</strong> This calculator provides estimates only. Actual rates and terms may vary based on credit score, 
          down payment, and lender requirements. Contact us for personalized financing options.
        </p>
      </div>
    </motion.div>
  );
}
