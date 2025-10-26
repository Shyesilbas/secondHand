import React, { useState } from 'react';
import DepositModal from './modals/DepositModal.jsx';
import WithdrawModal from './modals/WithdrawModal.jsx';
import LimitUpdateModal from './modals/LimitUpdateModal.jsx';
import CreateWalletModal from './modals/CreateWalletModal.jsx';

const EWalletActions = ({ 
  eWallet, 
  loading, 
  onCreateEWallet, 
  onUpdateLimits, 
  onUpdateSpendingWarningLimit, 
  onDeposit, 
  onWithdraw 
}) => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSpendingWarningModal, setShowSpendingWarningModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => setShowDepositModal(true)}
                className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100">
          Deposit
        </button>
        <button onClick={() => setShowWithdrawModal(true)}
                className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100">
          Withdraw
        </button>
        <button onClick={() => setShowLimitModal(true)}
                className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100">
          Update Limits
        </button>
        <button onClick={() => setShowSpendingWarningModal(true)}
                className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-100">
          Update Spending Warning
        </button>
      </div>

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={onDeposit}
        loading={loading}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={onWithdraw}
        loading={loading}
      />

      <LimitUpdateModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpdateLimits={onUpdateLimits}
        loading={loading}
        eWallet={eWallet}
        action="updateLimit"
      />

      <LimitUpdateModal
        isOpen={showSpendingWarningModal}
        onClose={() => setShowSpendingWarningModal(false)}
        onUpdateLimits={onUpdateSpendingWarningLimit}
        loading={loading}
        eWallet={eWallet}
        action="updateSpendingWarning"
      />

      <CreateWalletModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateEWallet={onCreateEWallet}
        loading={loading}
      />
    </>
  );
};

export default EWalletActions;
