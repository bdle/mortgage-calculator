import React, { useState } from 'react';
import { FormInput } from './components/FormInput';
import { BreakdownItem } from './components/BreakdownItem';
import { useMortgageCalculator } from './hooks/useMortgageCalculator';
import { formatUSNumber, parseUSNumber, formatCurrency } from './utils/formatters';

export default function MortgageCalculator() {
  const [purchasePrice, setPurchasePrice] = useState('1,600,000');

  // Dedicated Down Payment States (%) and ($)
  const [downPaymentPercent, setDownPaymentPercent] = useState('41.25');
  const [downPaymentAmount, setDownPaymentAmount] = useState('660,000');

  const [interestRate, setInterestRate] = useState('6.25');
  const [loanTermYears, setLoanTermYears] = useState(30);

  const [taxRatePerThousand, setTaxRatePerThousand] = useState('12.40');
  const [yearlyPropertyTax, setYearlyPropertyTax] = useState('19,840.00');
  const [yearlyInsurance, setYearlyInsurance] = useState('4,700');
  const [hoaFee, setHoaFee] = useState('0');
  const [yearlyWaterCost, setYearlyWaterCost] = useState('2000');

  const [monthlyRent, setMonthlyRent] = useState('10,650');
  const [propertyManagementRate, setPropertyManagementRate] = useState('4');
  const [propertyManagementFee, setPropertyManagementFee] = useState('426.00');

  // Purchase Price Change Handler (recalculates Down Payment $ & Property Tax)
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

    // Recalculate Property Tax based on Tax Rate per $1,000
    const rate = taxRatePerThousand === '' ? 0 : Number(parseUSNumber(taxRatePerThousand));
    setYearlyPropertyTax(formatUSNumber(((price / 1000) * rate).toFixed(2)));

    // Recalculate Down Payment ($) based on existing Down Payment (%)
    const pct = downPaymentPercent === '' ? 0 : Number(parseUSNumber(downPaymentPercent));
    setDownPaymentAmount(formatUSNumber(((price * pct) / 100).toFixed(0)));
  };

  // Down Payment (%) Change Handler
  const handleDownPaymentPercentChange = (e) => {
    const rawVal = e.target.value;
    setDownPaymentPercent(rawVal);

    if (rawVal === '') {
      setDownPaymentAmount('0');
      return;
    }

    const pct = Math.max(0, Math.min(100, Number(rawVal)));
    const price = purchasePrice === '' ? 0 : Number(parseUSNumber(purchasePrice));
    setDownPaymentAmount(formatUSNumber(((price * pct) / 100).toFixed(0)));
  };

  // Down Payment ($) Change Handler
  const handleDownPaymentAmountChange = (e) => {
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

  // Property Tax Rate Change Handler
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

  // Rent Income Change Handler
  const handleRentChange = (e) => {
    const rawVal = parseUSNumber(e.target.value);
    setMonthlyRent(rawVal === '' ? '' : formatUSNumber(rawVal));
    const rent = Number(rawVal) || 0;
    const rate = Number(parseUSNumber(propertyManagementRate)) || 0;
    setPropertyManagementFee(formatUSNumber(((rent * rate) / 100).toFixed(2)));
  };

  // Property Management Fee (%) Handler
  const handleManagementRateChange = (e) => {
    const rawVal = e.target.value;
    setPropertyManagementRate(rawVal);
    const rent = Number(parseUSNumber(monthlyRent)) || 0;
    setPropertyManagementFee(formatUSNumber(((rent * (Number(rawVal) || 0)) / 100).toFixed(2)));
  };

  // Property Management Fee ($) Handler
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
    setPropertyManagementRate(rent > 0 ? ((fee / rent) * 100).toFixed(2) : '0');
  };

  const calculations = useMortgageCalculator({
    purchasePrice,
    downPaymentType: 'amount',
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
      <h2 data-cy="app-title-header" style={styles.title}>Mortgage & Rent Roll Calculator</h2>

      <div style={styles.mainLayout}>
        <div style={styles.formContainer}>
          {/* LOAN DETAILS SECTION */}
          <h3 data-cy="loan-details-header" style={styles.sectionHeader}>Loan Details</h3>

          {/* PARENT GROUP: PURCHASE PRICE & DOWN PAYMENT */}
          <div style={styles.groupedWrapper}>
            <div style={styles.twoColumnGrid}>
              <FormInput
                label="Purchase Price"
                dataCy="purchase-price"
                prefix="$"
                value={purchasePrice}
                onChange={handlePriceChange}
              />

              {/* NESTED DOWN PAYMENT GROUP WITH SINGLE LABEL */}
              <div data-cy="down-container" style={styles.downPaymentGroupContainer}>
                <label data-cy="down-label" style={styles.label}>Down Payment</label>
                <div style={styles.nestedDownPaymentGroup}>
                  <FormInput
                    dataCy="down-payment-percent"
                    suffix="%"
                    value={downPaymentPercent}
                    onChange={handleDownPaymentPercentChange}
                  />
                  <FormInput
                    dataCy="down-payment-amount"
                    prefix="$"
                    value={downPaymentAmount}
                    onChange={handleDownPaymentAmountChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* INTEREST RATE & LOAN TERM */}
          <div style={styles.twoColumnGrid}>
            <FormInput
              label="Interest Rate"
              dataCy="interest-rate"
              suffix="%"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />

            <label dataCy="loan-term" style={styles.selectLabel}>
              Loan Term
              <select style={styles.select} value={loanTermYears} onChange={(e) => setLoanTermYears(Number(e.target.value))}>
                <option style={styles.option} value={15}>15 Years</option>
                <option style={styles.option} value={20}>20 Years</option>
                <option style={styles.option} value={30}>30 Years</option>
              </select>
            </label>
          </div>

          {/* TAXES & ADDITIONAL FEES */}
          <h3 style={styles.sectionHeader}>Expenses and Income</h3>
          <div style={styles.twoColumnGrid}>
            <FormInput dataCy="property-tax-rate" label="Property Tax Rate" prefix="$" longSuffix="per $1,000" value={taxRatePerThousand} onChange={handleTaxRateChange} />
            <FormInput dataCy="yearly-tax-rate" label="Yearly Property Tax" prefix="$" value={yearlyPropertyTax} onChange={(e) => setYearlyPropertyTax(formatUSNumber(parseUSNumber(e.target.value)))} />
            <FormInput dataCy="yearly-insurance" label="Yearly Insurance" prefix="$" value={yearlyInsurance} onChange={(e) => setYearlyInsurance(formatUSNumber(parseUSNumber(e.target.value)))} />
            <FormInput dataCy="hoa-fee" label="Monthly HOA Fee" prefix="$" value={hoaFee} onChange={(e) => setHoaFee(formatUSNumber(parseUSNumber(e.target.value)))} />
            <FormInput dataCy="yearly-water-cost" label="Yearly Water Cost" prefix="$" value={yearlyWaterCost} onChange={(e) => setYearlyWaterCost(formatUSNumber(parseUSNumber(e.target.value)))} />
            <FormInput dataCy="rent-roll" label="Expected Monthly Rent" prefix="$" value={monthlyRent} onChange={handleRentChange} />
          </div>

          {/* RENTAL MANAGEMENT */}
          <h3 style={styles.sectionHeader}>Rental Management</h3>
          <div style={styles.twoColumnGrid}>
            <FormInput dataCy="management-fee-rate" label="Management Fee" suffix="%" value={propertyManagementRate} onChange={handleManagementRateChange} />
            <FormInput dataCy="management-fee" label="Monthly Management Fee" prefix="$" value={propertyManagementFee} onChange={handleManagementFeeChange} />
          </div>
        </div>

        {/* RESULTS SUMMARY */}
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Estimated Monthly Payment</h3>
          <div style={styles.totalAmount}>${formatCurrency(calculations.totalMonthlyPayment)}</div>

          <div style={styles.breakdownList}>
            <BreakdownItem dataCy="principal-interest" label="Principal & Interest:" amount={calculations.monthlyPrincipalAndInterest} />
            <BreakdownItem dataCy="prop-tax" label="Property Tax:" amount={calculations.monthlyTax} />
            <BreakdownItem dataCy="insurance" label="Insurance:" amount={calculations.monthlyInsurance} />
            <BreakdownItem dataCy="hoa" label="HOA Fee:" amount={parseUSNumber(hoaFee)} />
            <BreakdownItem dataCy="water-util" label="Water Utility (Monthly):" amount={calculations.monthlyWater} />
            <BreakdownItem dataCy="prop-management" label={`Property Management (${propertyManagementRate || 0}%):`} amount={parseUSNumber(propertyManagementFee)} />
          </div>

          <hr style={styles.divider} />
          <BreakdownItem dataCy="loan-amount" label="Total Loan Amount:" amount={calculations.loanAmount} />
          <hr style={styles.divider} />

          {/* RENT ROLL ANALYSIS */}
          <h4 style={styles.rentHeader}>Rent Roll vs. Mortgage</h4>
          <div style={styles.breakdownList}>
            <BreakdownItem dataCy="rent-roll-income" label="Monthly Rent Income:" amount={calculations.rent} />
            <BreakdownItem dataCy="monthly-expense" label="Total Monthly Expenses:" amount={calculations.totalMonthlyPayment} />
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
    color: '#111827',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '32px',
    color: '#eb25cd',
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
  groupedWrapper: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    textAlign: 'left',
    display: 'block',
    marginBottom: '6px',
  },
  downPaymentGroupContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  nestedDownPaymentGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    alignItems: 'start',
  },
  sectionHeader: {
    margin: '12px 0 8px 0',
    fontSize: '18px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '4px',
    textAlign: 'left',
    color: '#8f2471',
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
    backgroundColor: '#ffffff',
    color: '#111827',
    width: '100%',
    outline: 'none',
  },
  option: {
    backgroundColor: '#ffffff',
    color: '#111827',
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
    color: '#ec3d3d',
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
    color: '#156325',
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