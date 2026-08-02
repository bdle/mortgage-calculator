import React from 'react';
import { handleInputFocus } from '../utils/formatters';

export function FormInput({ label, value, onChange, prefix, suffix, longSuffix }) {
    return (
        <label style={styles.label}>
            {label}
            <div style={styles.inputWrapper}>
                {prefix && <span style={styles.prefix}>{prefix}</span>}
                <input
                    type="text"
                    style={{
                        ...styles.input,
                        paddingLeft: prefix ? '26px' : '12px',
                        paddingRight: longSuffix ? '85px' : suffix ? '26px' : '12px',
                    }}
                    value={value}
                    onChange={onChange}
                    onFocus={handleInputFocus} // Select-all on click/focus [cite: 94, 95]
                />
                {(suffix || longSuffix) && (
                    <span style={styles.suffix}>{longSuffix || suffix}</span>
                )}
            </div>
        </label>
    );
}

const styles = {
    label: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        textAlign: 'left', // Left-indented labels 
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
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
        textAlign: 'left',
    },
};