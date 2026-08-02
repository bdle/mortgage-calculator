import React, { useState, useMemo } from 'react';

export default function MortgageCalculator() {
  // Core Loan Inputs
  const [purchasePrice, setPurchasePrice] = useState(400000);
  const [downPaymentType, setDownPaymentType] = useState('percent'); // 'percent' | 'amount'
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [downPaymentAmount, setDownPaymentAmount] = useState(80000);
  const [interestRate, setInterestRate] = useState(6.5); // %
  const [loanTermYears, setLoanTermYears] = useState(30);

  // Additional Monthly & Yearly Expenses
  const [yearlyPropertyTax, setYearlyPropertyTax] = useState(4800);
  const [yearlyInsurance, setYearlyInsurance] = useState(1200);
  const [hoaFee, setHoaFee] = useState(150); // Monthly
  const [waterUtility, setWaterUtility] = useState(80); // Monthly
  const [propertyManagementFee, setPropertyManagementFee] = useState(100); // Monthly

  // Handlers for Down Payment sync
  const handlePriceChange = (val) => {
    const price = Math.max(0, val);
    setPurchasePrice(price);
    if (downPaymentType === 'percent') {
      setDownPaymentAmount((price * downPaymentPercent) / 100);
    } else {
      setDownPaymentPercent(price > 0 ? (downPaymentAmount / price) * 100 : 0);
    }
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

// Basic Inline Styles
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  },
  title: {
    textAlign: 'center',
    marginBottom: '32px',
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
    borderBottom: '1px solid #ccc',
    paddingBottom: '4px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
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
    border: '1px solid #ccc',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  toggle: {
    background: '#f0f0f0',
    border: 'none',
    padding: '4px 12px',
    cursor: 'pointer',
  },
  activeToggle: {
    background: '#0070f3',
    color: '#fff',
    border: 'none',
    padding: '4px 12px',
    cursor: 'pointer',
  },
  summaryCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #e9ecef',
    height: 'fit-content',
  },
  summaryTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#0070f3',
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
  },
  divider: {
    margin: '16px 0',
    border: 'none',
    borderTop: '1px solid #ddd',
  },
};