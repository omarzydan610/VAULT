import React from 'react';
import { Plus, Wallet, Landmark, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function BalanceCard({
  balances,
  isFetchingRate,
  lastUpdated,
  onAddClick,
  onRefreshRateClick
}) {
  const bankUSDInEGP = balances.bankUSD * balances.usdToEgpRate;
  const totalBankBalanceEGP = balances.bankEGP + bankUSDInEGP;
  const grandTotalEGP = balances.cashEGP + totalBankBalanceEGP;

  return (
    <div className="w-full max-w-xl bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative transition-premium">
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
          onClick={onAddClick}
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
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                  <Landmark size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Bank</span>
              </div>
              
              {/* Live Exchange Rate inside Bank Section */}
              <div className="text-right flex flex-col items-end">
                <button 
                  type="button"
                  onClick={onRefreshRateClick}
                  disabled={isFetchingRate}
                  className="px-2 py-1 rounded-full bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-[9px] font-semibold text-zinc-300 hover:text-white transition-premium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Click to refresh exchange rate"
                >
                  <RefreshCw size={8} className={`text-zinc-400 ${isFetchingRate ? 'animate-spin' : ''}`} />
                  <span className="flex items-center gap-0.5">
                    1 USD = {balances.usdToEgpRate.toFixed(2)} EGP
                    <span className="pulse-indicator ml-0.5" />
                  </span>
                </button>
                {lastUpdated && (
                  <p className="text-[7px] text-zinc-500 mt-0.5 uppercase font-bold tracking-widest">
                    Upd: {lastUpdated}
                  </p>
                )}
              </div>
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
    </div>
  );
}
