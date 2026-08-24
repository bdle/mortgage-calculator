import React, { useState, useMemo } from 'react';
import { parseUSNumber, extractStreetName } from '../utils/formatters';

// Helper to compute Net Cash Flow for each row item
function computeRowNetCashFlow(data = {}) {
    const safe = data || {};
    const price = parseUSNumber(safe.purchasePrice);
    let down = parseUSNumber(safe.downPaymentAmount);
    const downPct = parseUSNumber(safe.downPaymentPercent);

    if (down === 0 && downPct > 0 && price > 0) {
        down = (price * downPct) / 100;
    }

    const rate = parseUSNumber(safe.interestRate);
    const termYears = parseUSNumber(safe.loanTerm) || 30;

    let taxYearly = parseUSNumber(safe.yearlyPropertyTax);
    const taxRate = parseUSNumber(safe.propertyTaxRate);
    if (taxYearly === 0 && taxRate > 0 && price > 0) {
        taxYearly = (price / 1000) * taxRate;
    }

    const insYearly = parseUSNumber(safe.yearlyInsurance);
    const hoa = parseUSNumber(safe.hoaFee);
    const waterYearly = parseUSNumber(safe.yearlyWaterCost);
    const rent = parseUSNumber(safe.monthlyRent);

    let mgmt = parseUSNumber(safe.propertyManagementFee);

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

    // Filter state values
    const [addressFilter, setAddressFilter] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [maxRate, setMaxRate] = useState('');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // 1. Apply Filtering First
    const filteredProFormas = useMemo(() => {
        return savedProFormas.filter((item) => {
            // Partial address matching
            if (addressFilter.trim() !== '') {
                const query = addressFilter.toLowerCase().trim();
                const full = (item.name || '').toLowerCase();
                const street = (extractStreetName(item.name) || '').toLowerCase();
                if (!full.includes(query) && !street.includes(query)) {
                    return false;
                }
            }
            const price = parseUSNumber(item.data?.purchasePrice);
            const parsedRate = parseUSNumber(item.data?.interestRate);
            const rate = typeof parsedRate === 'number' && !isNaN(parsedRate) ? parsedRate : 0;

            const numMaxPrice = parseUSNumber(maxPrice);
            const numMaxRate = parseUSNumber(maxRate);

            if (maxPrice !== '' && numMaxPrice > 0 && price !== numMaxPrice) {
                return false;
            }
            if (maxRate !== '' && numMaxRate > 0 && rate !== numMaxRate) {
                return false;
            }

            return true;
        });
    }, [savedProFormas, addressFilter, maxPrice, maxRate]);

    // 2. Apply Sorting to Filtered Data
    const sortedProFormas = useMemo(() => {
        return [...filteredProFormas].sort((a, b) => {
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
    }, [filteredProFormas, sortField, sortDirection]);

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

            {/* Filter Toolbar */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    alignItems: 'center',
                    backgroundColor: 'var(--input-bg, #ffffff)',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid var(--input-border, #e5e7eb)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                }}
            >
                <strong style={{ color: 'var(--input-color, #111827)' }}>Filters:</strong>
                {/* Partial Address Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <label htmlFor="filter-address" style={{ color: '#4b5563' }}>Pro forma:</label>
                    <input
                        id="filter-address"
                        type="text"
                        placeholder="partial name of pro forma"
                        value={addressFilter}
                        onChange={(e) => setAddressFilter(e.target.value)}
                        data-cy="filter-address-input"
                        style={{ ...filterInputStyle, width: '130px' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <label htmlFor="filter-max-price" style={{ color: '#4b5563' }}>Max Price ($):</label>
                    <input
                        id="filter-max-price"
                        type="text"
                        placeholder="e.g. 1,500,000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        data-cy="filter-max-price-input"
                        style={filterInputStyle}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <label htmlFor="filter-max-rate" style={{ color: '#4b5563' }}>Max Rate (%):</label>
                    <input
                        id="filter-max-rate"
                        type="text"
                        placeholder="e.g. 6.5"
                        value={maxRate}
                        onChange={(e) => setMaxRate(e.target.value)}
                        data-cy="filter-max-rate-input"
                        style={filterInputStyle}
                    />
                </div>

                {(maxPrice || maxRate) && (
                    <button
                        onClick={() => {
                            setMaxPrice('');
                            setMaxRate('');
                        }}
                        data-cy="clear-filters-btn"
                        style={clearBtnStyle}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

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
                            Pro forma Name{getSortIndicator('name')}
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
                    {sortedProFormas.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ ...cellStyle, textAlign: 'center', color: '#6b7280' }}>
                                No pro formas match the filter criteria.
                            </td>
                        </tr>
                    ) : (
                        sortedProFormas.map((item, index) => {
                            const streetName = extractStreetName(item.name);
                            const price = parseUSNumber(item.data?.purchasePrice);
                            const down = parseUSNumber(item.data?.downPaymentAmount);
                            const parsedRate = parseUSNumber(item.data?.interestRate);
                            const rate = typeof parsedRate === 'number' && !isNaN(parsedRate) ? parsedRate : 0;
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
                        })
                    )}
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

const filterInputStyle = {
    padding: '0.35rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid var(--input-border, #d1d5db)',
    backgroundColor: 'var(--input-bg, #ffffff)',
    color: 'var(--input-color, #111827)',
    fontSize: '0.85rem',
    width: '110px',
    outline: 'none',
};

const clearBtnStyle = {
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    cursor: 'pointer',
};