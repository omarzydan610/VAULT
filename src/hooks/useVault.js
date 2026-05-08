import { useState, useEffect } from 'react';
import { KEYS, loadState, saveState, loadRawString, saveRawString } from '../services/localStorage';
import { fetchUSDToEGPRate } from '../services/api';

export function useVault() {
  // --- STATE ---
  const [balances, setBalances] = useState(() => {
    return loadState(KEYS.BALANCES, {
      cashEGP: 0,
      bankEGP: 0,
      bankUSD: 0,
      usdToEgpRate: 48.50
    });
  });

  const [transactions, setTransactions] = useState(() => {
    const parsed = loadState(KEYS.TRANSACTIONS, []);
    return parsed.filter(t => !t.id.startsWith('init-'));
  });

  // Modal States
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [revertConfirmTxId, setRevertConfirmTxId] = useState(null);

  // Rate Fetching States
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => {
    return loadRawString(KEYS.RATE_UPDATED) || '';
  });

  // Toast notification
  const [toast, setToast] = useState(null);

  // Swipe States
  const [swipedTxId, setSwipedTxId] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0);

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    saveState(KEYS.BALANCES, balances);
  }, [balances]);

  useEffect(() => {
    saveState(KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  // --- TOAST HELPER ---
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // --- ACTIONS ---
  const addBalance = (amount, accountType, bankCurrency, note) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid positive amount.');
      return false;
    }

    const selectedCurrency = accountType === 'cash' ? 'EGP' : bankCurrency;

    // Update balances
    setBalances(prev => {
      const updated = { ...prev };
      if (accountType === 'cash') {
        updated.cashEGP += parsedAmount;
      } else {
        if (bankCurrency === 'EGP') {
          updated.bankEGP += parsedAmount;
        } else {
          updated.bankUSD += parsedAmount;
        }
      }
      return updated;
    });

    // Add transaction history
    const newTx = {
      id: Date.now().toString(),
      amount: parsedAmount,
      currency: selectedCurrency,
      type: accountType,
      txType: 'deposit',
      note: note.trim() || 'Balance Added',
      date: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast(`Successfully added ${parsedAmount.toLocaleString()} ${selectedCurrency}!`);
    return true;
  };

  const withdrawBalance = (withdrawAmount, withdrawSource, withdrawNote) => {
    const parsedAmount = parseFloat(withdrawAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid positive amount.');
      return false;
    }

    let currentBalance = 0;
    if (withdrawSource === 'cashEGP') {
      currentBalance = balances.cashEGP;
    } else if (withdrawSource === 'bankEGP') {
      currentBalance = balances.bankEGP;
    } else if (withdrawSource === 'bankUSD') {
      currentBalance = balances.bankUSD;
    }

    if (parsedAmount > currentBalance) {
      showToast(`Error: Insufficient funds! Selected account has only ${currentBalance.toLocaleString()} available.`);
      return false;
    }

    const selectedCurrency = withdrawSource === 'bankUSD' ? 'USD' : 'EGP';
    const selectedAccountType = withdrawSource === 'cashEGP' ? 'cash' : 'bank';

    // Deduct money
    setBalances(prev => {
      const updated = { ...prev };
      if (withdrawSource === 'cashEGP') {
        updated.cashEGP -= parsedAmount;
      } else if (withdrawSource === 'bankEGP') {
        updated.bankEGP -= parsedAmount;
      } else if (withdrawSource === 'bankUSD') {
        updated.bankUSD -= parsedAmount;
      }
      return updated;
    });

    // Store log
    const newTx = {
      id: Date.now().toString(),
      amount: parsedAmount,
      currency: selectedCurrency,
      type: selectedAccountType,
      txType: 'withdrawal',
      note: withdrawNote.trim() || 'Withdrawal / Expense',
      date: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast(`Successfully withdrew ${parsedAmount.toLocaleString()} ${selectedCurrency}!`);
    return true;
  };

  const deleteTransaction = (id) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;

    // Reverse the balance impact (subtract if deposit, add back if withdrawal)
    setBalances(prev => {
      const updated = { ...prev };
      const isDeposit = txToDelete.txType === 'deposit' || !txToDelete.txType;

      if (txToDelete.type === 'cash') {
        if (isDeposit) {
          updated.cashEGP -= txToDelete.amount;
        } else {
          updated.cashEGP += txToDelete.amount;
        }
      } else {
        if (txToDelete.currency === 'EGP') {
          if (isDeposit) {
            updated.bankEGP -= txToDelete.amount;
          } else {
            updated.bankEGP += txToDelete.amount;
          }
        } else {
          if (isDeposit) {
            updated.bankUSD -= txToDelete.amount;
          } else {
            updated.bankUSD += txToDelete.amount;
          }
        }
      }
      return updated;
    });

    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction reverted and removed.');
  };

  const refreshExchangeRate = async (showNotification = false) => {
    setIsFetchingRate(true);
    try {
      const { rate, lastUpdated: dateStr } = await fetchUSDToEGPRate();
      setBalances(prev => ({
        ...prev,
        usdToEgpRate: rate
      }));
      setLastUpdated(dateStr);
      saveRawString(KEYS.RATE_UPDATED, dateStr);

      if (showNotification) {
        showToast(`Exchange rate updated: 1 USD = ${rate.toFixed(2)} EGP`);
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      if (showNotification) {
        showToast('Failed to fetch latest exchange rate.');
      }
    } finally {
      setIsFetchingRate(false);
    }
  };

  useEffect(() => {
    refreshExchangeRate(false);
  }, []);

  // Swipe handling helpers
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e, txId) => {
    const touchCurrentX = e.touches[0].clientX;
    const diffX = touchCurrentX - touchStartX;
    if (diffX < -40) {
      setSwipedTxId(txId);
    } else if (diffX > 40) {
      if (swipedTxId === txId) setSwipedTxId(null);
    }
  };

  const handleMouseDown = (e) => {
    setTouchStartX(e.clientX);
  };

  const handleMouseMove = (e, txId) => {
    if (e.buttons === 1) {
      const currentX = e.clientX;
      const diffX = currentX - touchStartX;
      if (diffX < -40) {
        setSwipedTxId(txId);
      } else if (diffX > 40) {
        if (swipedTxId === txId) setSwipedTxId(null);
      }
    }
  };

  return {
    balances,
    transactions,
    toast,
    isDepositModalOpen,
    setIsDepositModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    revertConfirmTxId,
    setRevertConfirmTxId,
    isFetchingRate,
    lastUpdated,
    swipedTxId,
    setSwipedTxId,
    refreshExchangeRate,
    addBalance,
    withdrawBalance,
    deleteTransaction,
    swipeHandlers: {
      handleTouchStart,
      handleTouchMove,
      handleMouseDown,
      handleMouseMove,
    }
  };
}
