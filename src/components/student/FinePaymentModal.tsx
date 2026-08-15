import React, { useState } from 'react';
import { Fine, Payment } from '../../types';
import { verifyPaymentApi } from '../../services/api';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  AlertCircle, 
  Download, 
  Receipt,
  X,
  ShieldCheck
} from 'lucide-react';

interface FinePaymentModalProps {
  fine: Fine;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (payment: Payment) => void;
}

export const FinePaymentModal: React.FC<FinePaymentModalProps> = ({
  fine,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [method, setMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('student@okicici');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setIsProcessing(true);
    setError('');

    // Call backend payment verification
    const res = await verifyPaymentApi(
      fine.id,
      fine.amount,
      method === 'UPI' ? `UPI (${upiId})` : `CARD (${cardNumber})`
    );

    setIsProcessing(false);

    if (res.success && res.payment) {
      setCompletedPayment(res.payment);
      onPaymentSuccess(res.payment);
    } else {
      setError(res.error || 'Payment gateway verification failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!completedPayment ? (
          <div>
            <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">SECURE COLLEGE PAYMENT GATEWAY</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fine Settlement</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ref: <span className="font-mono font-bold">{fine.fineNumber}</span>
            </p>

            {/* Fine summary card */}
            <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{fine.reason}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Due Date: {fine.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total Payable</p>
                  <p className="text-xl font-black text-blue-600 dark:text-blue-400">₹{fine.amount}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    method === 'UPI'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-[11px]">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CARD')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    method === 'CARD'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[11px]">Debit/Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('NETBANKING')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    method === 'NETBANKING'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  <span className="text-[11px]">Net Banking</span>
                </button>
              </div>

              {/* Input for selected method */}
              {method === 'UPI' && (
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {method === 'CARD' && (
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Payment Server-side...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm & Pay ₹{fine.amount}</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              128-bit Encrypted SSL Gateway • Server-side Signature Verified
            </p>
          </div>
        ) : (
          /* RECEIPT VIEW AFTER SUCCESSFUL PAYMENT */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fine Paid & Verified!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official Digital Receipt Generated
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{completedPayment.gatewayPaymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fine Ref:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{fine.fineNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-500">₹{completedPayment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="text-slate-300">{completedPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">{completedPayment.paidAt}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
