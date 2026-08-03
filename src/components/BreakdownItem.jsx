import React from 'react';
import { formatCurrency } from '../utils/formatters';

export function BreakdownItem({ label, amount, dataCy }) {
    return (
        <div data-cy={`${dataCy}-items`} style={styles.breakdownItem}>
            <span>{label}</span>
            <strong>${formatCurrency(amount)}</strong>
        </div>
    );
}

const styles = {
    breakdownItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#374151',
    },
};