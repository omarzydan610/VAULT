export const KEYS = {
  BALANCES: 'expenses_balances',
  TRANSACTIONS: 'expenses_transactions',
  RATE_UPDATED: 'expenses_rate_last_updated'
};

/**
 * Loads data from localStorage with a fallback value.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export const loadState = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return defaultValue;
    return JSON.parse(saved);
  } catch (e) {
    console.error(`Error loading state for key ${key}:`, e);
    return defaultValue;
  }
};

/**
 * Saves data to localStorage.
 * @param {string} key
 * @param {*} value
 */
export const saveState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving state for key ${key}:`, e);
  }
};

/**
 * Loads raw string item from localStorage.
 * @param {string} key
 * @returns {string|null}
 */
export const loadRawString = (key) => {
  return localStorage.getItem(key);
};

/**
 * Saves raw string item to localStorage.
 * @param {string} key
 * @param {string} value
 */
export const saveRawString = (key, value) => {
  localStorage.setItem(key, value);
};
