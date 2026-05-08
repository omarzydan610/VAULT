import { useState, useEffect } from 'react';
import { 
  Plus, 
  Wallet, 
  Landmark, 
  X, 
  Check, 
  DollarSign, 
  RefreshCw, 
  Trash2, 
  ArrowUpRight,
  ChevronRight,
  Info,
  Calendar
} from 'lucide-react';

function App() {
  // --- STATE ---
  const [balances, setBalances] = useState(() => {
    const saved = localStorage.getItem('expenses_balances');
    return saved ? JSON.parse(saved) : {
      cashEGP: 0,
      bankEGP: 0,
      bankUSD: 0,
      usdToEgpRate: 48.50
    };
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('expenses_transactions');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter(t => !t.id.startsWith('init-'));
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [accountType, setAccountType] = useState('cash'); // 'cash' or 'bank'
  const [bankCurrency, setBankCurrency] = useState('EGP'); // 'EGP' or 'USD'
  const [note, setNote] = useState('');
  
  // Withdraw Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSource, setWithdrawSource] = useState('cashEGP'); // 'cashEGP', 'bankEGP', 'bankUSD'
  const [withdrawNote, setWithdrawNote] = useState('');
  
  // Rate Fetching States
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => {
    return localStorage.getItem('expenses_rate_last_updated') || '';
  });

  // Toast notification
  const [toast, setToast] = useState(null);

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('expenses_balances', JSON.stringify(balances));
  }, [balances]);

  useEffect(() => {
    localStorage.setItem('expenses_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // --- TOAST HELPER ---
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // --- ACTIONS ---
  const handleAddBalance = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid positive amount.');
      return;
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

    // Reset Form & Close Modal
    setAmount('');
    setNote('');
    setAccountType('cash');
    setBankCurrency('EGP');
    setIsModalOpen(false);
    showToast(`Successfully added ${parsedAmount.toLocaleString()} ${selectedCurrency}!`);
  };

  const handleDeleteTransaction = (id) => {
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

  const handleWithdraw = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(withdrawAmount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid positive amount.');
      return;
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
      return;
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

    // Reset Form & Close Modal
    setWithdrawAmount('');
    setWithdrawNote('');
    setWithdrawSource('cashEGP');
    setIsWithdrawModalOpen(false);
    showToast(`Successfully withdrew ${parsedAmount.toLocaleString()} ${selectedCurrency}!`);
  };

  const fetchExchangeRate = async (showNotification = false) => {
    setIsFetchingRate(true);
    try {
      const res = await fetch('https://api.exchangerate.fun/latest?base=USD');
      const data = await res.json();
      if (data && data.rates && data.rates.EGP) {
        const rate = data.rates.EGP;
        setBalances(prev => ({
          ...prev,
          usdToEgpRate: rate
        }));
        
        const dateStr = new Date(data.timestamp * 1000).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        setLastUpdated(dateStr);
        localStorage.setItem('expenses_rate_last_updated', dateStr);
        
        if (showNotification) {
          showToast(`Exchange rate updated: 1 USD = ${rate.toFixed(2)} EGP`);
        }
      } else {
        throw new Error('Invalid API response');
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
    fetchExchangeRate(false);
  }, []);

  // --- CALCULATIONS ---
  const bankUSDInEGP = balances.bankUSD * balances.usdToEgpRate;
  const totalBankBalanceEGP = balances.bankEGP + bankUSDInEGP;
  const grandTotalEGP = balances.cashEGP + totalBankBalanceEGP;

  // Formatting helpers
  const formatCurrency = (val, symbol = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: symbol,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val).replace(symbol, '').trim() + ' ' + symbol;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-100 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-modal px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`w-2 h-2 rounded-full animate-pulse ${toast.startsWith('Error') ? 'bg-red-500' : toast.startsWith('Notice') ? 'bg-amber-500' : 'bg-green-500'}`} />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">{toast}</span>
        </div>
      )}

      {/* Compact Balance Container */}
      <div className="w-full max-w-xl bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative transition-premium">
        
        {/* Header with Live Exchange Rate */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
            Vault Balance
          </h1>
          <div className="text-right flex flex-col items-end">
            <button 
              onClick={() => fetchExchangeRate(true)}
              disabled={isFetchingRate}
              className="px-3 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-semibold text-zinc-300 hover:text-white transition-premium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Click to refresh exchange rate"
            >
              <RefreshCw size={10} className={`text-zinc-400 ${isFetchingRate ? 'animate-spin' : ''}`} />
              <span className="flex items-center gap-1">
                1 USD = {balances.usdToEgpRate.toFixed(2)} EGP
                <span className="pulse-indicator ml-0.5" />
              </span>
            </button>
            {lastUpdated && (
              <p className="text-[8px] text-zinc-500 mt-1 uppercase font-bold tracking-widest">
                Updated: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        {/* 1. TOTAL BALANCE SECTION */}
        <div className="mb-8 border-b border-zinc-800/40 pb-6 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
              Total Balance
            </p>
            <div className="text-3xl font-black tracking-tight text-white font-mono leading-none">
              {formatCurrency(grandTotalEGP, 'EGP')}
            </div>
          </div>
          {/* Green Add Button next to Total Balance */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-950/20 text-white active:scale-95 transition-premium cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider shadow-md"
            title="Add Balance"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Add</span>
          </button>
        </div>

        {/* 2. HORIZONTALLY SPLIT CASH AND BANK BALANCE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Left Column: Cash Balance */}
          <div className="glass-panel p-5 rounded-2xl relative flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 mb-4">
                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                  <Wallet size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cash</span>
              </div>
              <p className="text-[10px] text-zinc-500 mb-1 font-semibold uppercase tracking-wider">EGP Balance</p>
              <p className="text-2xl font-black text-white font-mono tracking-tight">
                {formatCurrency(balances.cashEGP, 'EGP')}
              </p>
            </div>
          </div>

          {/* Right Column: Bank Balance */}
          <div className="glass-panel p-5 rounded-2xl relative flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 mb-4">
                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                  <Landmark size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Bank</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] text-zinc-400">
                  <span className="font-bold uppercase tracking-wider">EGP</span>
                  <span className="font-mono text-zinc-200 font-bold">{formatCurrency(balances.bankEGP, 'EGP')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 pb-3 border-b border-zinc-800/40">
                  <span className="font-bold uppercase tracking-wider">USD</span>
                  <div className="text-right font-mono">
                    <span className="text-zinc-200 font-bold block">{formatCurrency(balances.bankUSD, 'USD')}</span>
                    <span className="text-[9px] text-zinc-500 block font-bold">≈ {formatCurrency(bankUSDInEGP, 'EGP')}</span>
                  </div>
                </div>
                <div className="pt-1 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Total</span>
                  <span className="text-sm font-black text-white font-mono">{formatCurrency(totalBankBalanceEGP, 'EGP')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3. TRANSACTIONS SECTION */}
        <div className="mt-8 border-t border-zinc-800/40 pt-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Transaction History
              </h2>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Deposits & Withdrawals Ledger</p>
            </div>
            {/* Withdrawal Button */}
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:bg-rose-950/20 hover:border-rose-800/40 hover:text-rose-400 text-zinc-300 transition-premium active:scale-95 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider cursor-pointer"
              title="Add Withdrawal"
            >
              <Plus size={12} strokeWidth={3} className="text-rose-400" />
              <span>Withdraw</span>
            </button>
          </div>

          {/* Transactions List */}
          {transactions.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-800/40 rounded-2xl">
              <p className="text-xs text-zinc-600 font-medium">No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
              {transactions.map((tx) => {
                const isDeposit = tx.txType === 'deposit' || !tx.txType;
                return (
                  <div 
                    key={tx.id} 
                    className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/30 hover:border-zinc-800/80 hover:bg-zinc-900/50 transition-premium group animate-in fade-in slide-in-from-bottom-1 duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isDeposit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {tx.type === 'cash' ? <Wallet size={12} /> : <Landmark size={12} />}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-extrabold text-zinc-200 truncate">
                          {tx.note}
                        </p>
                        <p className="text-[8px] text-zinc-500 uppercase font-extrabold tracking-widest mt-0.5">
                          {tx.type === 'cash' ? 'Cash' : 'Bank'} • {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-black font-mono ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isDeposit ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-premium cursor-pointer"
                        title="Delete Transaction"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* FLOATING MODAL FOR ADDING BALANCE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-[32px] sm:rounded-[32px] overflow-hidden p-6 shadow-2xl relative animate-modal-pop max-h-[90vh] overflow-y-auto no-scrollbar"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
                  Add Balance
                </h3>
                <p className="text-[10px] text-zinc-500 tracking-wide font-medium">Increment your tracking vault</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddBalance} className="space-y-6">
              
              {/* 1. Account Type selection (Cash / Bank) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Select Destination Account
                </label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('cash');
                      setBankCurrency('EGP'); // Cash is only EGP
                    }}
                    className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      accountType === 'cash' 
                        ? 'bg-zinc-800 text-white shadow-md' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Wallet size={14} />
                    Cash
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setAccountType('bank')}
                    className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      accountType === 'bank' 
                        ? 'bg-zinc-800 text-white shadow-md' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Landmark size={14} />
                    Bank
                  </button>
                </div>
              </div>

              {/* 2. Bank Currency Selection (Shown ONLY if Bank is selected) */}
              {accountType === 'bank' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Select Currency
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setBankCurrency('EGP')}
                      className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest font-mono transition-all duration-200 cursor-pointer ${
                        bankCurrency === 'EGP' 
                          ? 'bg-zinc-800 text-white shadow-md' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      EGP
                    </button>
                    <button
                      type="button"
                      onClick={() => setBankCurrency('USD')}
                      className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest font-mono transition-all duration-200 cursor-pointer ${
                        bankCurrency === 'USD' 
                          ? 'bg-zinc-800 text-white shadow-md' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      USD
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Numeric Amount Input */}
              <div className="space-y-2">
                <label htmlFor="amount-input" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Amount to Add
                </label>
                <div className="relative">
                  <input
                    id="amount-input"
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-5 pr-16 text-xl font-bold font-mono text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    autoFocus
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black font-mono text-zinc-400 uppercase tracking-widest">
                    {accountType === 'cash' ? 'EGP' : bankCurrency}
                  </div>
                </div>
              </div>

              {/* 4. Description / Note */}
              <div className="space-y-2">
                <label htmlFor="note-input" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Note / Source (Optional)
                </label>
                <input
                  id="note-input"
                  type="text"
                  placeholder="e.g. Salary, Side hustle, Savings"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 px-5 text-xs text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-700"
                />
              </div>

              {/* Confirm Actions */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-white text-black font-extrabold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={14} strokeWidth={3} />
                  Add Balance
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FLOATING MODAL FOR WITHDRAWING BALANCE */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-[32px] sm:rounded-[32px] overflow-hidden p-6 shadow-2xl relative animate-modal-pop max-h-[90vh] overflow-y-auto no-scrollbar"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
                  Add Withdrawal
                </h3>
                <p className="text-[10px] text-zinc-500 tracking-wide font-medium">Minus money from your tracking vault</p>
              </div>
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleWithdraw} className="space-y-6">
              
              {/* 1. Account Source selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Select Source Account
                </label>
                <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setWithdrawSource('cashEGP')}
                    className={`py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wide transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      withdrawSource === 'cashEGP' 
                        ? 'bg-zinc-800 text-white shadow-md' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Wallet size={12} />
                    <span className="font-mono">Cash EGP</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setWithdrawSource('bankEGP')}
                    className={`py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wide transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      withdrawSource === 'bankEGP' 
                        ? 'bg-zinc-800 text-white shadow-md' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Landmark size={12} />
                    <span className="font-mono">Bank EGP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawSource('bankUSD')}
                    className={`py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wide transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      withdrawSource === 'bankUSD' 
                        ? 'bg-zinc-800 text-white shadow-md' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Landmark size={12} />
                    <span className="font-mono">Bank USD</span>
                  </button>
                </div>
              </div>

              {/* 2. Numeric Amount Input */}
              <div className="space-y-2">
                <label htmlFor="withdraw-amount-input" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <input
                    id="withdraw-amount-input"
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-5 pr-16 text-xl font-bold font-mono text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    autoFocus
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black font-mono text-zinc-400 uppercase tracking-widest">
                    {withdrawSource === 'bankUSD' ? 'USD' : 'EGP'}
                  </div>
                </div>
              </div>

              {/* 3. Description / Note */}
              <div className="space-y-2">
                <label htmlFor="withdraw-note-input" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Note / Category (Optional)
                </label>
                <input
                  id="withdraw-note-input"
                  type="text"
                  placeholder="e.g. Groceries, Rent, Coffee"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 px-5 text-xs text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-700"
                />
              </div>

              {/* Confirm Actions */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-white text-black font-extrabold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={14} strokeWidth={3} />
                  Add Withdrawal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}



    </div>
  );
}

export default App;
