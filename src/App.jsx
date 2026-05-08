import React from 'react';
import { useVault } from './hooks/useVault';
import Toast from './components/Toast';
import BalanceCard from './components/BalanceCard';
import TransactionsList from './components/TransactionsList';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';
import RevertModal from './components/RevertModal';
import logoImg from './assets/Logo.png';

function App() {
  const {
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
    swipeHandlers
  } = useVault();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-100 relative">
      
      {/* Toast Notification */}
      <Toast message={toast} />

      {/* App Logo & Header */}
      <div className="w-full max-w-xl flex flex-row items-center justify-center gap-4 mb-8 px-1 animate-in fade-in slide-in-from-top-3 duration-500">
        <img src={logoImg} alt="Vault Logo" className="w-14 h-14 object-contain" />
        <h1 className="text-4xl font-black tracking-widest uppercase text-white text-center">
          VAULT
        </h1>
      </div>

      {/* Compact Balance Container */}
      <BalanceCard
        balances={balances}
        isFetchingRate={isFetchingRate}
        lastUpdated={lastUpdated}
        onAddClick={() => setIsDepositModalOpen(true)}
        onRefreshRateClick={() => refreshExchangeRate(true)}
      />

      {/* Transactions Section */}
      <TransactionsList
        transactions={transactions}
        swipedTxId={swipedTxId}
        onWithdrawClick={() => setIsWithdrawModalOpen(true)}
        onRevertConfirm={(txId) => setRevertConfirmTxId(txId)}
        swipeHandlers={swipeHandlers}
      />

      {/* Floating Modals */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSubmit={addBalance}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSubmit={withdrawBalance}
      />

      <RevertModal
        isOpen={!!revertConfirmTxId}
        onClose={() => {
          setRevertConfirmTxId(null);
          setSwipedTxId(null);
        }}
        onConfirm={() => {
          deleteTransaction(revertConfirmTxId);
          setRevertConfirmTxId(null);
          setSwipedTxId(null);
        }}
      />

    </div>
  );
}

export default App;
