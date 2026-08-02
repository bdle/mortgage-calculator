import React, { useState, useMemo } from 'react';

// Helper to format numbers with US locale comma separators (e.g., 400000 -> "400,000")
const formatUSNumber = (val) => {
  if (val === '' || val === undefined || isNaN(val)) return '';
  const parts = val.toString().split('.');
  parts[0] = Number(parts[0]).toLocaleString('en-US');
  return parts.join('.');
};

// Helper to strip non-digit characters (except decimal) before updating state
const parseUSNumber = (val) => {
  if (val === '') return '';
  const clean = val.replace(/,/g, '');
  if (isNaN(clean)) return '';
  return clean;
};

export default function MortgageCalculator() {
  // Core Loan Inputs
  const [purchasePrice, setPurchasePrice] = useState('400,000');
  const [downPaymentType, setDownPaymentType] = useState('percent');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [downPaymentAmount, setDownPaymentAmount] = useState('80,000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTermYears, setLoanTermYears] = useState(30);

  // Property Tax Rate ($ per $1,000)
  const [taxRatePerThousand, setTaxRatePerThousand] = useState('12.40');

  // Additional Monthly & Yearly Expenses
  const [yearlyPropertyTax, setYearlyPropertyTax] = useState('4,960');
  const [yearlyInsurance, setYearlyInsurance] = useState('1,200');
  const [hoaFee, setHoaFee] = useState('150');
  const [yearlyWaterCost, setYearlyWaterCost] = useState('960');

  // Rental Income & Management Fee (%)
  const [monthlyRent, setMonthlyRent] = useState('3,500');
  const [propertyManagementRate, setPropertyManagementRate] = useState('8');
  const [propertyManagementFee, setPropertyManagementFee] = useState('280');

  // Purchase Price Change Handler
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

  // Tax Rate Change Handler
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

  // Down Payment Handlers
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

  // Monthly Rent Change Handler
  const handleRentChange = (e) => {
    const rawVal = parseUSNumber(e.target.value);
    if (rawVal === '') {
      setMonthlyRent('');
      setPropertyManagementFee('0');
      return;
    }

    const rent = Math.max(0, Number(rawVal));
    setMonthlyRent(formatUSNumber(rent));

    const rate = propertyManagementRate === '' ? 0 : Number(parseUSNumber(propertyManagementRate));
    const calculatedFee = (rent * rate) / 100;
    setPropertyManagementFee(formatUSNumber(calculatedFee.toFixed(2)));
  };

  // Property Management Rate (%) Handler
  const handleManagementRateChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      setPropertyManagementRate('');
      setPropertyManagementFee('0');
      return;
    }

    const rate = Math.max(0, Number(rawVal));
    setPropertyManagementRate(rawVal);

    const rent = monthlyRent === '' ? 0 : Number(parseUSNumber(monthlyRent));
    const calculatedFee = (rent * rate) / 100;
    setPropertyManagementFee(formatUSNumber(calculatedFee.toFixed(2)));
  };

  // Manual Property Management Fee ($) override handler
  const handleManagementFeeChange = (e) => {
    const rawVal = parseUSNumber(e.target.value);
    if (rawVal === '') {
      setPropertyManagementFee('');
      setPropertyManagementRate('0');
      return;
    }

    const fee = Math.max(0, Number(rawVal));
    setPropertyManagementFee(formatUSNumber(fee));

    const rent = monthlyRent === '' ? 0 : Number(parseUSNumber(monthlyRent));
    const calculatedRate = rent > 0 ? (fee / rent) * 100 : 0;
    setPropertyManagementRate(calculatedRate.toFixed(2));
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

    // Convert Yearly Water Cost into Monthly Expense
    const yearlyWater = yearlyWaterCost === '' ? 0 : Number(parseUSNumber(yearlyWaterCost));
    const monthlyWater = yearlyWater / 12;

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
      monthlyPrincipalAndInterest + monthlyTax + monthlyInsurance + hoa + monthlyWater + pm;

    const netCashFlow = rent - totalMonthlyPayment;
    const isRentCovered = netCashFlow >= 0;

    return {
      loanAmount,
      monthlyPrincipalAndInterest,
      monthlyTax,
      monthlyInsurance,
      monthlyWater,
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
    yearlyWaterCost,
    propertyManagementFee,
    monthlyRent,
  ]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Mortgage & Rent Roll Calculator</h2>

      <div style={styles.mainLayout}>
        {/* Input Form Section */}
        <div style={styles.formContainer}>
          {/* LOAN DETAILS SECTION */}
          <h3 style={styles.sectionHeader}>Loan Details</h3>
          <div style={styles.twoColumnGrid}>
            <label style={styles.label}>
              Purchase Price
              <div style={styles.inputWrapper}>
                <span style={styles.prefix}>$</span>
                <input
                  type="text"
                  style={styles.inputWithPrefix}
                  value={purchasePrice}
                  onChange={handlePriceChange}
                />
              </div>
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
                <div style={styles.inputWrapper}>
                  <input
                    type="text"
                    style={styles.inputWithSuffix}
                    value={downPaymentPercent}
                    onChange={handlePercentChange}
                  />
                  <span style={styles.suffix}>%</span>
                </div>
              ) : (
                <div style={styles.inputWrapper}>
                  <span style={styles.prefix}>$</span>
                  <input
                    type="text"
                    style={styles.inputWithPrefix}
                    value={downPaymentAmount}
                    onChange={handleAmountChange}
                  />
                </div>
              )}
            </div>

            <label style={styles.label}>
              Interest Rate
              <div style={styles.inputWrapper}>
                <input
                  type="text"
                  style={styles.inputWithSuffix}
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
                <span style={styles.suffix}>%</span>
              </div>
            </label>

            <label style={styles.label}>
              Loan Term
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
          </div>

          {/* TAXES & ADDITIONAL FEES SECTION */}
          <h3 style={styles.sectionHeader}>Taxes & Additional Fees</h3>
          <div style={styles.twoColumnGrid}>
            <label style={styles.label}>
              Property Tax Rate
              <div style={styles.inputWrapper}>
                <span style={styles.prefix}>$</span>
                <input
                  type="text"
                  style={styles.inputWithLongSuffix}
                  value={taxRatePerThousand}
                  onChange={handleTaxRateChange}
                />
                <span style={styles.suffix}>per $1,000</span>
              </div>
            </label>

            <label style={styles.label}>
              Yearly Property Tax
              <div style={styles.inputWrapper}>
                <span style={styles.prefix}>$</span>
                <input
                  type="text"
                  style={styles.inputWithPrefix}
                  value={yearlyPropertyTax}
                  onChange={(e) => setYearlyPropertyTax(formatUSNumber(parseUSNumber(e.target.value)))}
                />
              </div>
            </label>

            <label style={styles.label}>
              Yearly Insurance
              <div style={styles.inputWrapper}>
                <span style={styles.prefix}>$</span>
                <input
                  type="text"
                  style={styles.inputWithPrefix}
                  value={yearlyInsurance}
                  onChange={(e) => setYearlyInsurance(formatUSNumber(parseUSNumber(e.target.value)))}
                />
              </div>
            </label>

            <label style={styles.label}>
              Monthly HOA Fee
              <div style={styles.inputWrapper}>
                <span style={styles.prefix}>$</span>
                <input
                  type="text"
                  style={styles.inputWithPrefix}
                  value={hoaFee}
                  onChange={(e) => setHoaFee(formatUSNumber(parseUSNumber(e.target.value)))}
                />
              </div>
            </label>

            <label style={styles.label}>
              Yearly Water Cost
              <div style={styles.inputWrapper}>
                <span style={styles.prefix}>$</span>
                <input
                  type="text"
                  style={styles.inputWithPrefix}
                  value={yearlyWaterCost}
                  onChange={(e) => setYearlyWaterCost(formatUSNumber(parseUSNumber(e.target.value)))}
                />
              </div>
            </label>

            <label style={styles.label}>
              Expected Monthly Rent
              <div style={styles.inputWrapper}>
                <span style={styles.prefix}>$</span>
                <input
                  type="text"
                  style={styles.inputWithPrefix}
                  value={monthlyRent}
                  onChange={handleRentChange}
                />
              </div>
            </label>
          </div>

          {/* RENTAL MANAGEMENT SECTION */}
          <h3 style={styles.sectionHeader}>Rental Management</h3>
          <div style={styles.twoColumnGrid}>
            <label style={styles.label}>
              Management Fee (%)
              <div style={styles.inputWrapper}>
                <input
                  type="text"
                  style={styles.inputWithSuffix}
                  value={propertyManagementRate}
                  onChange={handleManagementRateChange}
                />
                <span style={styles.suffix}>%</span>
              </div>
            </label>

            <label style={styles.label}>
              Monthly Management Fee ($)
              <div style={styles.inputWrapper}>
                <span style={styles.prefix}>$</span>
                <input
                  type="text"
                  style={styles.inputWithPrefix}
                  value={propertyManagementFee}
                  onChange={handleManagementFeeChange}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Results Summary Section */}
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
              <span>Water Utility (Monthly):</span>
              <strong>${calculations.monthlyWater.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div style={styles.breakdownItem}>
              <span>Property Management ({propertyManagementRate || 0}%):</span>
              <strong>${(Number(parseUSNumber(propertyManagementFee)) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.breakdownItem}>
            <span>Total Loan Amount:</span>
            <strong>${calculations.loanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>

          <hr style={styles.divider} />

          {/* RENT ROLL VS MORTGAGE ANALYSIS */}
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

// Inline Style Configuration
const styles = {
  container: {
    maxWidth: '1000px',
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
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '32px',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  sectionHeader: {
    margin: '12px 0 8px 0',
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
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  prefix: {
    position: 'absolute',
    left: '12px',
    fontSize: '15px',
    color: '#6b7280',
    fontWeight: '500',
    pointerEvents: 'none',
  },
  suffix: {
    position: 'absolute',
    right: '12px',
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
    pointerEvents: 'none',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    color: '#111827',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputWithPrefix: {
    padding: '10px 12px 10px 26px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    color: '#111827',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputWithSuffix: {
    padding: '10px 26px 10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    color: '#111827',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputWithLongSuffix: {
    padding: '10px 85px 10px 26px', // Extra padding right for "per $1,000"
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    color: '#111827',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
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
    padding: '2px 8px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  activeToggle: {
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '2px 8px',
    fontSize: '12px',
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