/**
 * Fetches the latest USD to EGP exchange rate.
 * @returns {Promise<{rate: number, timestamp: string}>}
 */
export const fetchUSDToEGPRate = async () => {
  const res = await fetch('https://api.exchangerate.fun/latest?base=USD');
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  const data = await res.json();
  if (data && data.rates && data.rates.EGP) {
    const rate = data.rates.EGP;
    const dateStr = new Date(data.timestamp * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return { rate, lastUpdated: dateStr };
  }
  throw new Error('Invalid exchange rate API response structure');
};
