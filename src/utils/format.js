/**
 * Formats a numeric value as a currency string with standard locale formatting.
 * @param {number} val - The numeric amount to format.
 * @param {string} symbol - Currency symbol/code (e.g., 'EGP', 'USD').
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (val, symbol = 'EGP') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: symbol,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val).replace(symbol, '').trim() + ' ' + symbol;
};
