import React, { useState } from 'react';
import { X, Wallet, Landmark, Check } from 'lucide-react';

export default function WithdrawModal({ isOpen, onClose, onSubmit }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSource, setWithdrawSource] = useState('cashEGP'); // 'cashEGP', 'bankEGP', 'bankUSD'
  const [withdrawNote, setWithdrawNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onSubmit(withdrawAmount, withdrawSource, withdrawNote);
    if (success) {
      setWithdrawAmount('');
      setWithdrawNote('');
      setWithdrawSource('cashEGP');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden p-6 shadow-2xl relative animate-modal-pop max-h-[90vh] overflow-y-auto no-scrollbar"
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
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
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
  );
}
