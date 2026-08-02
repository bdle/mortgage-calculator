import React from 'react';

export function FormInput({ label, value, onChange, prefix, suffix, longSuffix }) {
    const handleInputFocus = (e) => e.target.select();

    return (
        <label style={styles.label}>
            {label && <span>{label}</span>}
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
                    onFocus={handleInputFocus}
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
        color: '#374151', // Explicit text color for dark mode
        textAlign: 'left',
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
        color: '#4b5563', // Explicit prefix text color
        fontWeight: '500',
        pointerEvents: 'none',
    },
    suffix: {
        position: 'absolute',
        right: '12px',
        fontSize: '13px',
        color: '#4b5563', // Explicit suffix text color
        fontWeight: '500',
        pointerEvents: 'none',
    },
    input: {
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        fontSize: '15px',
        backgroundColor: '#ffffff', // Explicit input background
        color: '#111827',           // Explicit input text color
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        textAlign: 'left',
    },
};