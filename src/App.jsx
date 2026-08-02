import React, { useState, useMemo } from 'react';

export default function MortgageCalculator() {
  const DEFAULT_PURCHASE_PRICE = 1600000;
  // Core Loan Inputs
  const [purchasePrice, setPurchasePrice] = useState(DEFAULT_PURCHASE_PRICE);
  const [downPaymentType, setDownPaymentType] = useState('percent'); // 'percent' | 'amount'
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [downPaymentAmount, setDownPaymentAmount] = useState(80000);
  const [interestRate, setInterestRate] = useState(6.5); // %
  const [loanTermYears, setLoanTermYears] = useState(30);

  // Additional Monthly & Yearly Expenses
  // Tax Rate: $12.40 per $1,000 of purchase price
  const TAX_RATE_PER_THOUSAND = 12.40;
  const [taxRatePerThousand, setTaxRatePerThousand] = useState(TAX_RATE_PER_THOUSAND);

  // Default property tax set to $4,960 based on $400,000 purchase price ($12.40 per $1,000)
  const [yearlyPropertyTax, setYearlyPropertyTax] = useState((DEFAULT_PURCHASE_PRICE / 1000) * taxRatePerThousand);

  const [yearlyInsurance, setYearlyInsurance] = useState(1200);
  const [hoaFee, setHoaFee] = useState(150); // Monthly
  const [waterUtility, setWaterUtility] = useState(80); // Monthly
  const [propertyManagementFee, setPropertyManagementFee] = useState(100); // Monthly

  // Handlers for Down Payment sync
  const handlePriceChange = (val) => {
    const price = Math.max(0, val);

    setPurchasePrice(price);
    // Recalculate Property Tax based on current tax rate
    setYearlyPropertyTax((price / 1000) * taxRatePerThousand);

    if (downPaymentType === 'percent') {
      setDownPaymentAmount((price * downPaymentPercent) / 100);
    } else {
      setDownPaymentPercent(price > 0 ? (downPaymentAmount / price) * 100 : 0);
    }
  };

  // Handler for Property Tax Rate Change ($ per $1,000)
  const handleTaxRateChange = (rate) => {
    const validRate = Math.max(0, rate);
    setTaxRatePerThousand(validRate);

    // Dynamically update Property Tax value when Tax Rate changes:
    // Property Tax = (Purchase Price / 1,000) * Tax Rate
    setYearlyPropertyTax((purchasePrice / 1000) * validRate);
  };

  const handlePercentChange = (val) => {
    const pct = Math.max(0, Math.min(100, val));
    setDownPaymentPercent(pct);
    setDownPaymentAmount((purchasePrice * pct) / 100);
  };

  const handleAmountChange = (val) => {
    const amt = Math.max(0, val);
    setDownPaymentAmount(amt);
    setDownPaymentPercent(purchasePrice > 0 ? (amt / purchasePrice) * 100 : 0);
  };

  // Calculations
  const calculations = useMemo(() => {
    const actualDownPayment = downPaymentType === 'percent'
      ? (purchasePrice * downPaymentPercent) / 100
      : downPaymentAmount;

    const loanAmount = Math.max(0, purchasePrice - actualDownPayment);
    const monthlyInterestRate = interestRate / 100 / 12;
    const totalPayments = loanTermYears * 12;

    // Principal & Interest Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    let monthlyPrincipalAndInterest = 0;
    if (monthlyInterestRate > 0 && totalPayments > 0) {
      monthlyPrincipalAndInterest =
        (loanAmount *
          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments))) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
    } else if (totalPayments > 0) {
      monthlyPrincipalAndInterest = loanAmount / totalPayments;
    }

    const monthlyTax = yearlyPropertyTax / 12;
    const monthlyInsurance = yearlyInsurance / 12;

    const totalMonthlyPayment =
      monthlyPrincipalAndInterest +
      monthlyTax +
      monthlyInsurance +
      hoaFee +
      waterUtility +
      propertyManagementFee;

    return {
      loanAmount,
      monthlyPrincipalAndInterest,
      monthlyTax,
      monthlyInsurance,
      totalMonthlyPayment,
    };
  }, [
    purchasePrice,
    downPaymentType,
    downPaymentPercent,
    downPaymentAmount,
    interestRate,
    loanTermYears,
    yearlyPropertyTax,
    yearlyInsurance,
    hoaFee,
    waterUtility,
    propertyManagementFee,
  ]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Mortgage & Monthly Expense Calculator</h2>

      <div style={styles.grid}>
        {/* Form Inputs */}
        <div style={styles.formGroup}>
          <h3 style={styles.sectionHeader}>Loan Details</h3>

          <label style={styles.label}>
            Purchase Price ($)
            <input
              type="number"
              style={styles.input}
              value={purchasePrice}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
            />
          </label>

          <div style={styles.downPaymentContainer}>
            <div style={styles.downPaymentHeader}>
              <label style={styles.label}>Down Payment</label>
              <div style={styles.toggleGroup}>
                <button
                  type="button"
                  style={downPaymentType === 'percent' ? styles.activeToggle : styles.toggle}
                  onClick={() => setDownPaymentType('percent')}
                >
                  %
                </button>
                <button
                  type="button"
                  style={downPaymentType === 'amount' ? styles.activeToggle : styles.toggle}
                  onClick={() => setDownPaymentType('amount')}
                >
                  $
                </button>
              </div>
            </div>

            {downPaymentType === 'percent' ? (
              <input
                type="number"
                style={styles.input}
                value={Number(downPaymentPercent.toFixed(2))}
                onChange={(e) => handlePercentChange(Number(e.target.value))}
              />
            ) : (
              <input
                type="number"
                style={styles.input}
                value={downPaymentAmount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
              />
            )}
          </div>

          <label style={styles.label}>
            Interest Rate (%)
            <input
              type="number"
              step="0.1"
              style={styles.input}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
            />
          </label>

          <label style={styles.label}>
            Loan Term (Years)
            <select
              style={styles.input}
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(Number(e.target.value))}
            >
              <option value={15}>15 Years</option>
              <option value={20}>20 Years</option>
              <option value={30}>30 Years</option>
            </select>
          </label>

          <h3 style={styles.sectionHeader}>Taxes & Additional Fees</h3>

          <label style={styles.label}>
            Property Tax Rate ($ per $1,000)
            <input
              type="number"
              step="0.1"
              style={styles.input}
              value={taxRatePerThousand}
              onChange={(e) => handleTaxRateChange(Number(e.target.value))}
            />
          </label>
          <label style={styles.label}>
            Yearly Property Tax ($)
            <input
              type="number"
              style={styles.input}
              value={yearlyPropertyTax}
              onChange={(e) => setYearlyPropertyTax(Number(e.target.value))}
            />
          </label>

          <label style={styles.label}>
            Yearly Insurance ($)
            <input
              type="number"
              style={styles.input}
              value={yearlyInsurance}
              onChange={(e) => setYearlyInsurance(Number(e.target.value))}
            />
          </label>

          <label style={styles.label}>
            Monthly HOA Fee ($)
            <input
              type="number"
              style={styles.input}
              value={hoaFee}
              onChange={(e) => setHoaFee(Number(e.target.value))}
            />
          </label>

          <label style={styles.label}>
            Monthly Water Utility ($)
            <input
              type="number"
              style={styles.input}
              value={waterUtility}
              onChange={(e) => setWaterUtility(Number(e.target.value))}
            />
          </label>

          <label style={styles.label}>
            Monthly Property Management Fee ($)
            <input
              type="number"
              style={styles.input}
              value={propertyManagementFee}
              onChange={(e) => setPropertyManagementFee(Number(e.target.value))}
            />
          </label>
        </div>

        {/* Results Summary */}
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Estimated Monthly Payment</h3>
          <div style={styles.totalAmount}>
            ${calculations.totalMonthlyPayment.toFixed(2)}
          </div>

          <div style={styles.breakdownList}>
            <div style={styles.breakdownItem}>
              <span>Principal & Interest:</span>
              <strong>${calculations.monthlyPrincipalAndInterest.toFixed(2)}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Property Tax:</span>
              <strong>${calculations.monthlyTax.toFixed(2)}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Insurance:</span>
              <strong>${calculations.monthlyInsurance.toFixed(2)}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>HOA Fee:</span>
              <strong>${hoaFee.toFixed(2)}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Water Utility:</span>
              <strong>${waterUtility.toFixed(2)}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Property Management:</span>
              <strong>${propertyManagementFee.toFixed(2)}</strong>
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.breakdownItem}>
            <span>Total Loan Amount:</span>
            <strong>${calculations.loanAmount.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated Styles for High-Contrast Light Theme Baseline
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#212529',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '32px',
    color: '#111827',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '32px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    margin: '16px 0 8px 0',
    fontSize: '18px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '4px',
    color: '#111827',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    color: '#111827',
    outline: 'none',
  },
  downPaymentContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  downPaymentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleGroup: {
    display: 'flex',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  toggle: {
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    padding: '4px 12px',
    cursor: 'pointer',
  },
  activeToggle: {
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '4px 12px',
    cursor: 'pointer',
  },
  summaryCard: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    height: 'fit-content',
    color: '#111827',
  },
  summaryTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    textAlign: 'center',
    color: '#111827',
  },
  totalAmount: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: '24px',
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#374151',
  },
  divider: {
    margin: '16px 0',
    border: 'none',
    borderTop: '1px solid #e5e7eb',
  },
};