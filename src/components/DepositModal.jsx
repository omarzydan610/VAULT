import React, { useState } from 'react';
import { X, Wallet, Landmark, Check } from 'lucide-react';

export default function DepositModal({ isOpen, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [accountType, setAccountType] = useState('cash'); // 'cash' or 'bank'
  const [bankCurrency, setBankCurrency] = useState('EGP'); // 'EGP' or 'USD'
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onSubmit(amount, accountType, bankCurrency, note);
    if (success) {
      setAmount('');
      setNote('');
      setAccountType('cash');
      setBankCurrency('EGP');
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
              Add Balance
            </h3>
            <p className="text-[10px] text-zinc-500 tracking-wide font-medium">Increment your tracking vault</p>
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
  );
}
