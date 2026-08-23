// Formats numbers with US locale comma separators (e.g., 400000 -> "400,000") [cite: 43, 61, 75]
export const formatUSNumber = (val) => {
    if (val === '' || val === undefined || isNaN(val)) return '';
    const parts = val.toString().split('.');
    parts[0] = Number(parts[0]).toLocaleString('en-US');
    return parts.join('.');
};

// Strips non-digit characters (except decimals) before parsing values [cite: 84]
export const parseUSNumber = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const clean = String(val).replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
};

// Formats a raw number as US currency string with 2 decimal places [cite: 43, 75]
export const formatCurrency = (val) => {
    if (val === undefined || val === null || val === '') return '';
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

export function extractStreetName(name = '') {
    if (!name || typeof name !== 'string') return '';
    // Splits at the first comma or hyphen if followed by city/state info
    //   const parts = name.split(/[,–—]/);
    // Splits at the first occurrence of the word "pay" (case-insensitive)
    // Uses \b to ensure whole word match, or remove \b if partial matching (e.g. payment) is desired
    const parts = name.split(/\bpay\b/i);
    return parts[0].trim();
}