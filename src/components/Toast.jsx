import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;

  const isError = message.startsWith('Error');
  const isNotice = message.startsWith('Notice');

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-modal px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
      <div 
        className={`w-2 h-2 rounded-full animate-pulse ${
          isError ? 'bg-red-500' : isNotice ? 'bg-amber-500' : 'bg-green-500'
        }`} 
      />
      <span className="text-xs font-semibold tracking-wide text-zinc-200">
        {message}
      </span>
    </div>
  );
}
