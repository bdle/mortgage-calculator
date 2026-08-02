import React, { useState } from 'react';
import { FormInput } from './components/FormInput';
import { BreakdownItem } from './components/BreakdownItem';
import { useMortgageCalculator } from './hooks/useMortgageCalculator';
import { formatUSNumber, parseUSNumber, formatCurrency } from './utils/formatters';

export default function MortgageCalculator() {
  const [purchasePrice, setPurchasePrice] = useState('400,000');
  const [downPaymentType, setDownPaymentType] = useState('percent');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [downPaymentAmount, setDownPaymentAmount] = useState('80,000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTermYears, setLoanTermYears] = useState(30);

  const [taxRatePerThousand, setTaxRatePerThousand] = useState('12.40');
  const [yearlyPropertyTax, setYearlyPropertyTax] = useState('4,960');
  const [yearlyInsurance, setYearlyInsurance] = useState('1,200');
  const [hoaFee, setHoaFee] = useState('0');
  const [yearlyWaterCost, setYearlyWaterCost] = useState('960');

  const [monthlyRent, setMonthlyRent] = useState('0');
  const [propertyManagementRate, setPropertyManagementRate] = useState('4');
  const [propertyManagementFee, setPropertyManagementFee] = useState('140');

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
    setYearlyPropertyTax(formatUSNumber(((price / 1000) * rate).toFixed(2)));

    if (downPaymentType === 'percent') {
      const pct = downPaymentPercent === '' ? 0 : Number(parseUSNumber(downPaymentPercent));
      setDownPaymentAmount(formatUSNumber(((price * pct) / 100).toFixed(0)));
    } else {
      const amt = downPaymentAmount === '' ? 0 : Number(parseUSNumber(downPaymentAmount));
      setDownPaymentPercent(price > 0 ? ((amt / price) * 100).toFixed(2) : '0');
    }
  };

  const handleTaxRateChange = (e) => {
    const rawVal = e.target.value;
    setTaxRatePerThousand(rawVal);
    if (rawVal === '') {
      setYearlyPropertyTax('0');
      return;
    }
    const price = purchasePrice === '' ? 0 : Number(parseUSNumber(purchasePrice));
    setYearlyPropertyTax(formatUSNumber(((price / 1000) * Number(rawVal)).toFixed(2)));
  };

  const handleRentChange = (e) => {
    const rawVal = parseUSNumber(e.target.value);
    setMonthlyRent(rawVal === '' ? '' : formatUSNumber(rawVal));
    const rent = Number(rawVal) || 0;
    const rate = Number(parseUSNumber(propertyManagementRate)) || 0;
    setPropertyManagementFee(formatUSNumber(((rent * rate) / 100).toFixed(2)));
  };

  const handleManagementRateChange = (e) => {
    const rawVal = e.target.value;
    setPropertyManagementRate(rawVal);
    const rent = Number(parseUSNumber(monthlyRent)) || 0;
    setPropertyManagementFee(formatUSNumber(((rent * (Number(rawVal) || 0)) / 100).toFixed(2)));
  };

  const calculations = useMortgageCalculator({
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
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Mortgage & Rent Roll Calculator</h2>

      <div style={styles.mainLayout}>
        <div style={styles.formContainer}>
          {/* LOAN DETAILS */}
          <h3 style={styles.sectionHeader}>Loan Details</h3>
          <div style={styles.twoColumnGrid}>
            <FormInput label="Purchase Price" prefix="$" value={purchasePrice} onChange={handlePriceChange} />

            {/* TOGGLEABLE DOWN PAYMENT FIELD */}
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
                <FormInput
                  suffix="%"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(e.target.value)}
                />
              ) : (
                <FormInput
                  prefix="$"
                  value={downPaymentAmount}
                  onChange={(e) => setDownPaymentAmount(formatUSNumber(parseUSNumber(e.target.value)))}
                />
              )}
            </div>

            <FormInput label="Interest Rate" suffix="%" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />

            <label style={styles.selectLabel}>
              Loan Term
              <select style={styles.select} value={loanTermYears} onChange={(e) => setLoanTermYears(Number(e.target.value))}>
                <option style={styles.option} value={15}>15 Years</option>
                <option style={styles.option} value={20}>20 Years</option>
                <option style={styles.option} value={30}>30 Years</option>
              </select>
            </label>
          </div>

          {/* TAXES & ADDITIONAL FEES */}
          <h3 style={styles.sectionHeader}>Taxes & Additional Fees</h3>
          <div style={styles.twoColumnGrid}>
            <FormInput label="Property Tax Rate" prefix="$" longSuffix="per $1,000" value={taxRatePerThousand} onChange={handleTaxRateChange} />
            <FormInput label="Yearly Property Tax" prefix="$" value={yearlyPropertyTax} onChange={(e) => setYearlyPropertyTax(formatUSNumber(parseUSNumber(e.target.value)))} />
            <FormInput label="Yearly Insurance" prefix="$" value={yearlyInsurance} onChange={(e) => setYearlyInsurance(formatUSNumber(parseUSNumber(e.target.value)))} />
            <FormInput label="Monthly HOA Fee" prefix="$" value={hoaFee} onChange={(e) => setHoaFee(formatUSNumber(parseUSNumber(e.target.value)))} />
            <FormInput label="Yearly Water Cost" prefix="$" value={yearlyWaterCost} onChange={(e) => setYearlyWaterCost(formatUSNumber(parseUSNumber(e.target.value)))} />
            <FormInput label="Expected Monthly Rent" prefix="$" value={monthlyRent} onChange={handleRentChange} />
          </div>

          {/* RENTAL MANAGEMENT */}
          <h3 style={styles.sectionHeader}>Rental Management</h3>
          <div style={styles.twoColumnGrid}>
            <FormInput label="Property Management Fee (%)" suffix="%" value={propertyManagementRate} onChange={handleManagementRateChange} />
            <FormInput label="Monthly Property Management Fee ($)" prefix="$" value={propertyManagementFee} onChange={(e) => setPropertyManagementFee(formatUSNumber(parseUSNumber(e.target.value)))} />
          </div>
        </div>

        {/* RESULTS SUMMARY */}
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Estimated Monthly Payment</h3>
          <div style={styles.totalAmount}>${formatCurrency(calculations.totalMonthlyPayment)}</div>

          <div style={styles.breakdownList}>
            <BreakdownItem label="Principal & Interest:" amount={calculations.monthlyPrincipalAndInterest} />
            <BreakdownItem label="Property Tax:" amount={calculations.monthlyTax} />
            <BreakdownItem label="Insurance:" amount={calculations.monthlyInsurance} />
            <BreakdownItem label="HOA Fee:" amount={parseUSNumber(hoaFee)} />
            <BreakdownItem label="Water Utility (Monthly):" amount={calculations.monthlyWater} />
            <BreakdownItem label={`Property Management (${propertyManagementRate || 0}%):`} amount={parseUSNumber(propertyManagementFee)} />
          </div>

          <hr style={styles.divider} />
          <BreakdownItem label="Total Loan Amount:" amount={calculations.loanAmount} />
          <hr style={styles.divider} />

          {/* RENT ROLL ANALYSIS */}
          <h4 style={styles.rentHeader}>Rent Roll vs. Mortgage</h4>
          <div style={styles.breakdownList}>
            <BreakdownItem label="Monthly Rent Income:" amount={calculations.rent} />
            <BreakdownItem label="Total Monthly Expenses:" amount={calculations.totalMonthlyPayment} />
          </div>

          <div style={{
            ...styles.cashFlowBox,
            backgroundColor: calculations.isRentCovered ? '#f0fdf4' : '#fef2f2',
            borderColor: calculations.isRentCovered ? '#bbf7d0' : '#fecaca',
          }}>
            <div style={styles.cashFlowLabel}>Net Monthly Cash Flow</div>
            <div style={{ ...styles.cashFlowAmount, color: calculations.isRentCovered ? '#16a34a' : '#dc2626' }}>
              {calculations.netCashFlow >= 0 ? '+' : '-'}${formatCurrency(Math.abs(calculations.netCashFlow))}
            </div>
            <div style={{ ...styles.statusBadge, backgroundColor: calculations.isRentCovered ? '#15803d' : '#b91c1c' }}>
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
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#111827',           // Fixed high-contrast text color
    backgroundColor: '#ffffff', // Fixed white background for dark mode compatibility
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
    textAlign: 'left',
    color: '#111827',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    textAlign: 'left',
  },
  selectLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    textAlign: 'left',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    backgroundColor: '#ffffff', // Fixed select background
    color: '#111827',           // Fixed select text color
    width: '100%',
    outline: 'none',
  },
  option: {
    backgroundColor: '#ffffff', // Fixed option background
    color: '#111827',           // Fixed option text color
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
  divider: {
    margin: '16px 0',
    border: 'none',
    borderTop: '1px solid #e5e7eb',
  },
  rentHeader: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'left',
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