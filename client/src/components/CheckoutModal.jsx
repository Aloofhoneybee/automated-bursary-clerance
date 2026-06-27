import React, { useState, useEffect } from 'react';
import { initializePayment } from '../api/payments';

export default function CheckoutModal({ isOpen, onClose, amount, studentCategory }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentOption, setPaymentOption] = useState('full'); // 'full' or 'custom'
  const [customVal, setCustomVal] = useState('');
  const [initiatingPayment, setInitiatingPayment] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentOption('full');
      setCustomVal('');
      setInitiatingPayment(false);
      setLoading(false);
      setError('');
    }
  }, [isOpen, amount]);

  if (!isOpen) return null;

  const handleCustomValChange = (e) => {
    const val = e.target.value;
    const cleanVal = val.replace(/\D/g, '');
    if (cleanVal === '') {
      setCustomVal('');
    } else {
      setCustomVal(Number(cleanVal).toLocaleString('en-US'));
    }
  };

  const handleProceed = (e) => {
    e.preventDefault();
    
    let amtToPay;
    if (paymentOption === 'full') {
      amtToPay = amount;
    } else {
      amtToPay = parseFloat(customVal.replace(/,/g, ''));
      if (isNaN(amtToPay) || amtToPay < 100) {
        setError('Minimum payment amount is ₦100');
        return;
      }
      if (amtToPay > amount) {
        setError(`Payment amount cannot exceed outstanding balance of ₦${amount.toLocaleString()}`);
        return;
      }
    }

    setInitiatingPayment(true);
    setLoading(true);
    setError('');
    
    const category = studentCategory || '100 Level';

    initializePayment(category, amtToPay)
      .then((res) => {
        if (res.status === 'success' && res.data?.authorizationUrl) {
          // Redirect to Paystack secure checkout
          window.location.href = res.data.authorizationUrl;
        } else {
          setError(res.message || 'Failed to initialize checkout gateway.');
          setLoading(false);
          setInitiatingPayment(false);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Connection to checkout gateway failed.');
        setLoading(false);
        setInitiatingPayment(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Header - Paystack branding */}
        <div className="bg-[#1f2d3d] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#09a5db] flex items-center justify-center font-bold text-xs">P</div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">Secure Checkout</h3>
              <p className="text-[10px] text-[#09a5db] font-semibold">Paystack Gateway Integration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dynamic Panel based on checkout flow state */}
        <div className="min-h-[220px] flex flex-col">
          {error && (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-150">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-secondary">Gateway Connection Failed</h4>
                <p className="text-[10px] text-red-500 font-semibold mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="px-5 py-2 bg-gray-105 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all mt-4 cursor-pointer"
              >
                Go Back
              </button>
            </div>
          )}

          {!error && initiatingPayment && (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 flex-1">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="text-[13px] font-bold text-secondary">Contacting Paystack Gateway...</h4>
                <p className="text-[10px] text-gray-400 mt-1">Please wait, you will be redirected to the secure payment page.</p>
              </div>
            </div>
          )}

          {!error && !initiatingPayment && (
            <form onSubmit={handleProceed} className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Option 1: Full Payment */}
                <label className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentOption === 'full' 
                    ? 'border-primary bg-primary/5 text-slate-800' 
                    : 'border-gray-200 hover:border-gray-300 text-slate-600 bg-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentOption"
                      value="full"
                      checked={paymentOption === 'full'}
                      onChange={() => setPaymentOption('full')}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider block text-gray-400">Full Payment</span>
                      <span className="text-xs font-bold">Pay Outstanding Balance</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-slate-800">
                    ₦{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </label>

                {/* Option 2: Custom Payment */}
                <label className={`flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all gap-3.5 ${
                  paymentOption === 'custom' 
                    ? 'border-primary bg-primary/5 text-slate-800' 
                    : 'border-gray-200 hover:border-gray-300 text-slate-600 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentOption"
                        value="custom"
                        checked={paymentOption === 'custom'}
                        onChange={() => setPaymentOption('custom')}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-wider block text-gray-400">Custom Payment</span>
                        <span className="text-xs font-bold">Pay What You Want / Partial</span>
                      </div>
                    </div>
                  </div>
                  
                  {paymentOption === 'custom' && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-500 font-bold text-sm">₦</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={customVal}
                          onChange={handleCustomValChange}
                          required
                          className="w-full h-10 pl-7 pr-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-sm font-bold bg-white text-slate-800"
                          placeholder="0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium">Minimum payment is ₦100. Maximum is the outstanding balance.</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 h-11 bg-white border border-gray-250 hover:bg-gray-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
