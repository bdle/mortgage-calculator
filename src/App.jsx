import React, { useState, useMemo } from 'react';

// Helper to format numbers with US locale comma separators (e.g., 400000 -> "400,000") [cite: 30]
const formatUSNumber = (val) => {
  if (val === '' || val === undefined || isNaN(val)) return '';
  const parts = val.toString().split('.');
  parts[0] = Number(parts[0]).toLocaleString('en-US');
  return parts.join('.');
};

// Helper to strip non-digit characters (except decimal) before updating state [cite: 30]
const parseUSNumber = (val) => {
  if (val === '') return '';
  const clean = val.replace(/,/g, '');
  if (isNaN(clean)) return '';
  return clean;
};

export default function MortgageCalculator() {
  // Core Loan Inputs [cite: 1, 2]
  const [purchasePrice, setPurchasePrice] = useState('400,000');
  const [downPaymentType, setDownPaymentType] = useState('percent');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [downPaymentAmount, setDownPaymentAmount] = useState('80,000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTermYears, setLoanTermYears] = useState(30);

  // Property Tax Rate ($ per $1,000) [cite: 22, 23, 24]
  const [taxRatePerThousand, setTaxRatePerThousand] = useState('12.40');

  // Additional Monthly & Yearly Expenses 
  const [yearlyPropertyTax, setYearlyPropertyTax] = useState('4,960');
  const [yearlyInsurance, setYearlyInsurance] = useState('1,200');
  const [hoaFee, setHoaFee] = useState('150');
  const [waterUtility, setWaterUtility] = useState('80');
  const [propertyManagementFee, setPropertyManagementFee] = useState('100');

  // NEW: Expected Monthly Rent Input
  const [monthlyRent, setMonthlyRent] = useState('3,500');

  // Purchase Price Change Handler [cite: 23, 25]
  const handlePriceChange = (e) => {
    const rawVal = parseUSNumber(e.target.value);
    if (rawVal === '') {
      setPurchasePrice('');
      setYearlyPropertyTax('');
      setDownPaymentAmount('');
      return;
    }

    const price = Math.max(0, Number(rawVal));
    setPurchasePrice(formatUSNumber(price));

    const rate = taxRatePerThousand === '' ? 0 : Number(parseUSNumber(taxRatePerThousand));
    const calculatedTax = (price / 1000) * rate;
    setYearlyPropertyTax(formatUSNumber(calculatedTax.toFixed(2)));

    if (downPaymentType === 'percent') {
      const pct = downPaymentPercent === '' ? 0 : Number(parseUSNumber(downPaymentPercent));
      setDownPaymentAmount(formatUSNumber(((price * pct) / 100).toFixed(0)));
    } else {
      const amt = downPaymentAmount === '' ? 0 : Number(parseUSNumber(downPaymentAmount));
      setDownPaymentPercent(price > 0 ? ((amt / price) * 100).toFixed(2) : '0');
    }
  };

  // Tax Rate Change Handler [cite: 24, 25]
  const handleTaxRateChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      setTaxRatePerThousand('');
      setYearlyPropertyTax('0');
      return;
    }

    setTaxRatePerThousand(rawVal);
    const rate = Math.max(0, Number(rawVal));
    const price = purchasePrice === '' ? 0 : Number(parseUSNumber(purchasePrice));
    const calculatedTax = (price / 1000) * rate;
    setYearlyPropertyTax(formatUSNumber(calculatedTax.toFixed(2)));
  };

  // Down Payment Handlers [cite: 1, 2]
  const handlePercentChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      setDownPaymentPercent('');
      setDownPaymentAmount('0');
      return;
    }

    const pct = Math.max(0, Math.min(100, Number(rawVal)));
    setDownPaymentPercent(rawVal);

    const price = purchasePrice === '' ? 0 : Number(parseUSNumber(purchasePrice));
    setDownPaymentAmount(formatUSNumber(((price * pct) / 100).toFixed(0)));
  };

  const handleAmountChange = (e) => {
    const rawVal = parseUSNumber(e.target.value);
    if (rawVal === '') {
      setDownPaymentAmount('');
      setDownPaymentPercent('0');
      return;
    }

    const amt = Math.max(0, Number(rawVal));
    setDownPaymentAmount(formatUSNumber(amt));

    const price = purchasePrice === '' ? 0 : Number(parseUSNumber(purchasePrice));
    setDownPaymentPercent(price > 0 ? ((amt / price) * 100).toFixed(2) : '0');
  };

  // Calculations Memo
  const calculations = useMemo(() => {
    const price = purchasePrice === '' ? 0 : Number(parseUSNumber(purchasePrice));
    const pct = downPaymentPercent === '' ? 0 : Number(parseUSNumber(downPaymentPercent));
    const dpAmt = downPaymentAmount === '' ? 0 : Number(parseUSNumber(downPaymentAmount));
    const rate = interestRate === '' ? 0 : Number(parseUSNumber(interestRate));
    const term = Number(loanTermYears) || 0;

    const tax = yearlyPropertyTax === '' ? 0 : Number(parseUSNumber(yearlyPropertyTax));
    const ins = yearlyInsurance === '' ? 0 : Number(parseUSNumber(yearlyInsurance));
    const hoa = hoaFee === '' ? 0 : Number(parseUSNumber(hoaFee));
    const water = waterUtility === '' ? 0 : Number(parseUSNumber(waterUtility));
    const pm = propertyManagementFee === '' ? 0 : Number(parseUSNumber(propertyManagementFee));
    const rent = monthlyRent === '' ? 0 : Number(parseUSNumber(monthlyRent));

    const actualDownPayment = downPaymentType === 'percent' ? (price * pct) / 100 : dpAmt;
    const loanAmount = Math.max(0, price - actualDownPayment);
    const monthlyInterestRate = rate / 100 / 12;
    const totalPayments = term * 12;

    let monthlyPrincipalAndInterest = 0;
    if (monthlyInterestRate > 0 && totalPayments > 0) {
      monthlyPrincipalAndInterest =
        (loanAmount *
          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments))) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
    } else if (totalPayments > 0) {
      monthlyPrincipalAndInterest = loanAmount / totalPayments;
    }

    const monthlyTax = tax / 12;
    const monthlyInsurance = ins / 12;

    const totalMonthlyPayment =
      monthlyPrincipalAndInterest + monthlyTax + monthlyInsurance + hoa + water + pm;

    // Rent Roll vs Mortgage calculation
    const netCashFlow = rent - totalMonthlyPayment;
    const isRentCovered = netCashFlow >= 0;

    return {
      loanAmount,
      monthlyPrincipalAndInterest,
      monthlyTax,
      monthlyInsurance,
      totalMonthlyPayment,
      rent,
      netCashFlow,
      isRentCovered,
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
    monthlyRent,
  ]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Mortgage & Rent Roll Calculator</h2>

      <div style={styles.grid}>
        {/* Form Inputs */}
        <div style={styles.formGroup}>
          <h3 style={styles.sectionHeader}>Loan Details</h3>

          <label style={styles.label}>
            Purchase Price ($)
            <input
              type="text"
              style={styles.input}
              value={purchasePrice}
              onChange={handlePriceChange}
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
                type="text"
                style={styles.input}
                value={downPaymentPercent}
                onChange={handlePercentChange}
              />
            ) : (
              <input
                type="text"
                style={styles.input}
                value={downPaymentAmount}
                onChange={handleAmountChange}
              />
            )}
          </div>

          <label style={styles.label}>
            Interest Rate (%)
            <input
              type="text"
              style={styles.input}
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
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
              type="text"
              style={styles.input}
              value={taxRatePerThousand}
              onChange={handleTaxRateChange}
            />
          </label>

          <label style={styles.label}>
            Yearly Property Tax ($)
            <input
              type="text"
              style={styles.input}
              value={yearlyPropertyTax}
              onChange={(e) => setYearlyPropertyTax(formatUSNumber(parseUSNumber(e.target.value)))}
            />
          </label>

          <label style={styles.label}>
            Yearly Insurance ($)
            <input
              type="text"
              style={styles.input}
              value={yearlyInsurance}
              onChange={(e) => setYearlyInsurance(formatUSNumber(parseUSNumber(e.target.value)))}
            />
          </label>

          <label style={styles.label}>
            Monthly HOA Fee ($)
            <input
              type="text"
              style={styles.input}
              value={hoaFee}
              onChange={(e) => setHoaFee(formatUSNumber(parseUSNumber(e.target.value)))}
            />
          </label>

          <label style={styles.label}>
            Monthly Water Utility ($)
            <input
              type="text"
              style={styles.input}
              value={waterUtility}
              onChange={(e) => setWaterUtility(formatUSNumber(parseUSNumber(e.target.value)))}
            />
          </label>

          <label style={styles.label}>
            Monthly Property Management Fee ($)
            <input
              type="text"
              style={styles.input}
              value={propertyManagementFee}
              onChange={(e) => setPropertyManagementFee(formatUSNumber(parseUSNumber(e.target.value)))}
            />
          </label>

          <h3 style={styles.sectionHeader}>Rental Income</h3>

          <label style={styles.label}>
            Expected Monthly Rent ($)
            <input
              type="text"
              style={styles.input}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(formatUSNumber(parseUSNumber(e.target.value)))}
            />
          </label>
        </div>

        {/* Results Summary */}
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Estimated Monthly Payment</h3>
          <div style={styles.totalAmount}>
            ${calculations.totalMonthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div style={styles.breakdownList}>
            <div style={styles.breakdownItem}>
              <span>Principal & Interest:</span>
              <strong>${calculations.monthlyPrincipalAndInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Property Tax:</span>
              <strong>${calculations.monthlyTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Insurance:</span>
              <strong>${calculations.monthlyInsurance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>HOA Fee:</span>
              <strong>${(Number(parseUSNumber(hoaFee)) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Water Utility:</span>
              <strong>${(Number(parseUSNumber(waterUtility)) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Property Management:</span>
              <strong>${(Number(parseUSNumber(propertyManagementFee)) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.breakdownItem}>
            <span>Total Loan Amount:</span>
            <strong>${calculations.loanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>

          {/* RENT ROLL VS MORTGAGE ANALYSIS SECTION */}
          <hr style={styles.divider} />

          <h4 style={styles.rentHeader}>Rent Roll vs. Mortgage</h4>

          <div style={styles.breakdownList}>
            <div style={styles.breakdownItem}>
              <span>Monthly Rent Income:</span>
              <strong>${calculations.rent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Total Monthly Expenses:</span>
              <strong>${calculations.totalMonthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <div style={{
            ...styles.cashFlowBox,
            backgroundColor: calculations.isRentCovered ? '#f0fdf4' : '#fef2f2',
            borderColor: calculations.isRentCovered ? '#bbf7d0' : '#fecaca',
          }}>
            <div style={styles.cashFlowLabel}>Net Monthly Cash Flow</div>
            <div style={{
              ...styles.cashFlowAmount,
              color: calculations.isRentCovered ? '#16a34a' : '#dc2626',
            }}>
              {calculations.netCashFlow >= 0 ? '+' : '-'}
              ${Math.abs(calculations.netCashFlow).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{
              ...styles.statusBadge,
              backgroundColor: calculations.isRentCovered ? '#15803d' : '#b91c1c',
            }}>
              {calculations.isRentCovered ? 'Rent Covers Mortgage' : 'Rent Deficit'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  rentHeader: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  cashFlowBox: {
    marginTop: '16px',
    padding: '16px',
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  cashFlowLabel: {
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#4b5563',
  },
  cashFlowAmount: {
    fontSize: '28px',
    fontWeight: '800',
  },
  statusBadge: {
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '4px',
  },
};