// Formats numbers with US locale comma separators (e.g., 400000 -> "400,000") [cite: 43, 61, 75]
export const formatUSNumber = (val) => {
    if (val === '' || val === undefined || isNaN(val)) return '';
    const parts = val.toString().split('.');
    parts[0] = Number(parts[0]).toLocaleString('en-US');
    return parts.join('.');
};

// Strips non-digit characters (except decimals) before parsing values [cite: 84]
export const parseUSNumber = (val) => {
    if (val === '') return '';
    const clean = val.toString().replace(/,/g, '');
    return isNaN(clean) ? '' : clean;
};

// Formats a raw number as US currency string with 2 decimal places [cite: 43, 75]
export const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// Helper to select all text inside an input field on click/focus [cite: 94, 95]
export const handleInputFocus = (e) => {
    e.target.select();
};