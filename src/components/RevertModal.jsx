import React from 'react';
import { Info } from 'lucide-react';

export default function RevertModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden p-6 shadow-2xl relative animate-modal-pop"
        role="dialog"
        aria-modal="true"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <Info size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
              Revert Transaction?
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Are you sure you want to revert this transaction? The funds will be rolled back and the log entry will be permanently deleted.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-red-950/20"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
