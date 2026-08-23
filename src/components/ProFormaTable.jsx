import React, { useState, useMemo } from 'react';
import { parseUSNumber, extractStreetName } from '../utils/formatters';

// Helper to compute Net Cash Flow for each row item

export function computeRowNetCashFlow(data = {}) {
    const safe = data || {};

    const price = parseUSNumber(safe.purchasePrice);
    let down = parseUSNumber(safe.downPaymentAmount);
    const downPct = parseUSNumber(safe.downPaymentPercent);

    // Fallback: If dollar down payment is 0 but percent exists
    if (down === 0 && downPct > 0 && price > 0) {
        down = (price * downPct) / 100;
    }

    const rate = parseUSNumber(safe.interestRate);
    const termYears = parseUSNumber(safe.loanTerm) || 30;

    // Taxes: Use stored yearly tax or calculate from rate ($ per $1,000)
    let taxYearly = parseUSNumber(safe.yearlyPropertyTax);
    const taxRate = parseUSNumber(safe.propertyTaxRate);
    if (taxYearly === 0 && taxRate > 0 && price > 0) {
        taxYearly = (price / 1000) * taxRate;
    }

    const insYearly = parseUSNumber(safe.yearlyInsurance);
    const hoa = parseUSNumber(safe.hoaFee);
    const waterYearly = parseUSNumber(safe.yearlyWaterCost);
    const rent = parseUSNumber(safe.monthlyRent);

    // Management Fee: Use stored dollar amount or calculate from percent of rent
    let mgmt = parseUSNumber(safe.propertyManagementFee);

    // Monthly Principal & Interest Calculation
    const loanAmount = Math.max(0, price - down);
    const monthlyRate = rate > 0 ? rate / 100 / 12 : 0;
    const numPayments = termYears > 0 ? termYears * 12 : 0;

    let monthlyPI = 0;
    if (loanAmount > 0 && numPayments > 0) {
        if (monthlyRate > 0) {
            monthlyPI =
                (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
                (Math.pow(1 + monthlyRate, numPayments) - 1);
        } else {
            monthlyPI = loanAmount / numPayments;
        }
    }

    const monthlyTax = taxYearly / 12;
    const monthlyInsurance = insYearly / 12;
    const monthlyWater = waterYearly / 12;

    const totalMonthlyExpense =
        monthlyPI + monthlyTax + monthlyInsurance + hoa + monthlyWater + mgmt;

    return rent - totalMonthlyExpense;
}

export default function ProFormaTable({ savedProFormas, onLoad, onDelete }) {
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedProFormas = useMemo(() => {
        return [...savedProFormas].sort((a, b) => {
            let aVal, bVal;

            switch (sortField) {
                case 'name':
                    aVal = (a.name || '').toLowerCase();
                    bVal = (b.name || '').toLowerCase();
                    return sortDirection === 'asc'
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);

                case 'purchasePrice':
                    aVal = parseUSNumber(a.data?.purchasePrice);
                    bVal = parseUSNumber(b.data?.purchasePrice);
                    break;

                case 'downPaymentAmount':
                    aVal = parseUSNumber(a.data?.downPaymentAmount);
                    bVal = parseUSNumber(b.data?.downPaymentAmount);
                    break;

                case 'interestRate':
                    aVal = parseUSNumber(a.data?.interestRate);
                    bVal = parseUSNumber(b.data?.interestRate);
                    break;

                case 'netCashFlow':
                    aVal = computeRowNetCashFlow(a.data);
                    bVal = computeRowNetCashFlow(b.data);
                    break;

                default:
                    return 0;
            }

            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }, [savedProFormas, sortField, sortDirection]);

    const getSortIndicator = (field) => {
        if (sortField !== field) return ' ↕';
        return sortDirection === 'asc' ? ' ↑' : ' ↓';
    };

    if (!savedProFormas || savedProFormas.length === 0) {
        return null;
    }

    return (
        <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', color: 'var(--input-color, #111827)' }}>
                Saved Pro Formas
            </h3>
            <table
                data-cy="proforma-table"
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: 'var(--input-bg, #ffffff)',
                    color: 'var(--input-color, #111827)',
                    border: '1px solid var(--input-border, #e5e7eb)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                }}
            >
                <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                        <th onClick={() => handleSort('name')} data-cy="sort-name-header" style={headerStyle}>
                            Property Name{getSortIndicator('name')}
                        </th>
                        <th onClick={() => handleSort('purchasePrice')} data-cy="sort-purchase-price-header" style={headerStyle}>
                            Purchase Price{getSortIndicator('purchasePrice')}
                        </th>
                        <th onClick={() => handleSort('downPaymentAmount')} data-cy="sort-down-amount-header" style={headerStyle}>
                            Down Amount{getSortIndicator('downPaymentAmount')}
                        </th>
                        <th onClick={() => handleSort('interestRate')} data-cy="sort-interest-rate-header" style={headerStyle}>
                            Interest Rate{getSortIndicator('interestRate')}
                        </th>
                        <th onClick={() => handleSort('netCashFlow')} data-cy="sort-net-cash-flow-header" style={headerStyle}>
                            Net Cash Flow{getSortIndicator('netCashFlow')}
                        </th>
                        <th style={{ ...headerStyle, textAlign: 'center', cursor: 'default' }}>
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProFormas.map((item, index) => {
                        const streetName = extractStreetName(item.name);
                        const price = parseUSNumber(item.data?.purchasePrice);
                        const down = parseUSNumber(item.data?.downPaymentAmount);
                        const rate = parseUSNumber(item.data?.interestRate);
                        const cashFlow = computeRowNetCashFlow(item.data);
                        const isPositive = cashFlow >= 0;

                        return (
                            <tr
                                key={item.id}
                                data-cy={`proforma-row-${index}`}
                                style={{ borderBottom: '1px solid var(--input-border, #f3f4f6)' }}
                            >
                                <td style={cellStyle}><strong>{streetName}</strong></td>
                                <td style={cellStyle}>${price.toLocaleString('en-US')}</td>
                                <td style={cellStyle}>${down.toLocaleString('en-US')}</td>
                                <td style={cellStyle}>{rate.toFixed(2)}%</td>
                                <td
                                    style={{
                                        ...cellStyle,
                                        fontWeight: '600',
                                        color: isPositive ? '#16a34a' : '#dc2626',
                                    }}
                                    data-cy={`proforma-cashflow-${index}`}
                                >
                                    {isPositive ? '+' : '-'}${Math.abs(cashFlow).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </td>
                                <td style={{ ...cellStyle, textAlign: 'center' }}>
                                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => onLoad(item)}
                                            data-cy={`load-proforma-btn-${index}`}
                                            style={actionBtnStyle}
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="btn-delete"
                                            data-cy={`delete-proforma-btn-${index}`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

const headerStyle = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    userSelect: 'none',
};

const cellStyle = {
    padding: '0.75rem 1rem',
};

const actionBtnStyle = {
    padding: '0.25rem 0.6rem',
    fontSize: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#111827',
    cursor: 'pointer',
};