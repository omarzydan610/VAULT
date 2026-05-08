import React from 'react';
import { Plus, Wallet, Landmark, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function TransactionsList({
  transactions,
  swipedTxId,
  onWithdrawClick,
  onRevertConfirm,
  swipeHandlers
}) {
  const { handleTouchStart, handleTouchMove, handleMouseDown, handleMouseMove } = swipeHandlers;

  return (
    <div className="w-full max-w-xl bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative transition-premium mt-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Transaction History
          </h2>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
            Deposits & Withdrawals Ledger
          </p>
        </div>
        
        {/* Withdrawal Button */}
        <button
          onClick={onWithdrawClick}
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
            const isSwiped = swipedTxId === tx.id;
            return (
              <div key={tx.id} className="relative overflow-hidden rounded-xl select-none">
                
                {/* Underlying Absolute Revert Action */}
                <div className={`absolute inset-y-0 right-0 flex items-center pr-2 z-0 transition-opacity duration-200 ${isSwiped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                  <button
                    type="button"
                    onClick={() => onRevertConfirm(tx.id)}
                    className="px-3 py-2 rounded-lg bg-red-950/40 border border-red-800/40 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-premium cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider shadow-md"
                  >
                    <RotateCcw size={12} />
                    <span>Revert</span>
                  </button>
                </div>

                {/* Foreground Swipeable List Item */}
                <div 
                  onMouseDown={handleMouseDown}
                  onMouseMove={(e) => handleMouseMove(e, tx.id)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={(e) => handleTouchMove(e, tx.id)}
                  style={{ transform: isSwiped ? 'translateX(-85px)' : 'translateX(0)' }}
                  className="flex justify-between items-center p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800/80 hover:bg-zinc-900/50 transition-transform duration-300 ease-out group relative z-10 cursor-grab active:cursor-grabbing"
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
                  
                  <div className="shrink-0 relative flex items-center justify-end">
                    <span className={`text-xs font-black font-mono ${isDeposit ? 'text-emerald-400' : 'text-rose-400'} group-hover:opacity-0 transition-opacity duration-200`}>
                      {isDeposit ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRevertConfirm(tx.id)}
                      className="absolute right-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-premium cursor-pointer"
                      title="Delete Transaction"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
