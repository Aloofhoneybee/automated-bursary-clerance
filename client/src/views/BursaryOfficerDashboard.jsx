import React, { useState, useEffect } from 'react';
import { getAllTransactions } from '../api/payments';

export default function BursaryOfficerDashboard() {
  const [loading, setLoading] = useState(true);

  // States
  const [disputes, setDisputes] = useState([]);
  const [failedTrans, setFailedTrans] = useState([]);

  const loadDashboardData = () => {
    setLoading(true);
    getAllTransactions()
      .then((txRes) => {
        // Process all transactions for Failed list and Disputes (pending checkouts)
        const allTx = txRes.data || [];
        
        // Filter Failed transactions
        const failed = allTx
          .filter(t => t.status === 'failed' || t.status === 'cancelled')
          .map(t => ({
            ref: t.paystackReference,
            student: t.student?.fullName || 'Unknown',
            matric: t.student?.matricNumber || 'N/A',
            amount: t.amount,
            reason: t.status === 'cancelled' ? 'User Cancelled Checkout' : (t.paystackResponse?.gateway_response || 'Gateway Decline'),
            status: t.status,
            date: new Date(t.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
          }));
        setFailedTrans(failed.slice(0, 5));

        // Filter Pending transactions (Disputes)
        const pending = allTx
          .filter(t => t.status === 'pending')
          .map(t => ({
            id: t._id,
            student: t.student?.fullName || 'Unknown',
            matric: t.student?.matricNumber || 'N/A',
            amount: t.amount,
            issue: 'Payment pending confirmation / checkout session abandoned',
            date: new Date(t.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
            status: 'Pending Verification'
          }));
        setDisputes(pending.slice(0, 5));
      })
      .catch((err) => {
        console.error('Failed to load officer dashboard:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading && disputes.length === 0 && failedTrans.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-semibold">Loading bursary queues...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">Bursary Operations</h1>
          <p className="text-xs text-gray-500 font-medium mt-1 hidden md:block">Reconciliation dashboards and payment dispute resolutions.</p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="group h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-gray-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
        >
          <svg className={`w-4 h-4 text-gray-400 group-hover:text-slate-600 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-all duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Disputes & Failed Transactions Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Disputes Panel */}
        <div className="bg-white rounded-[20px] border border-gray-200 p-6 space-y-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div>
            <h3 className="text-[15px] font-bold text-secondary">Payment Dispute Tickets</h3>
            <p className="text-xs text-gray-400 mt-0.5">Pending checkout attempts / unreconciled payments</p>
          </div>

          <div className="space-y-3">
            {disputes.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-semibold">
                No pending payment disputes logged.
              </div>
            ) : (
              disputes.map((dis, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-gray-400 truncate max-w-[120px]">{dis.ref || 'Checkout'}</span>
                      <span className="text-gray-300">•</span>
                      <h4 className="text-[12px] font-bold text-slate-800 truncate">{dis.student} ({dis.matric})</h4>
                    </div>
                    <p className="text-xs text-gray-505 font-medium leading-relaxed">{dis.issue}</p>
                    <span className="text-[9px] text-gray-400 block pt-1 font-mono">Attempt Date: {dis.date}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-bold text-slate-900 block font-mono">₦{dis.amount.toLocaleString()}</span>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 border bg-orange-50 border-orange-100 text-orange-600 uppercase">
                      {dis.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Failed Transactions list */}
        <div className="bg-white rounded-[20px] border border-gray-200 p-6 space-y-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div>
            <h3 className="text-[15px] font-bold text-secondary">Failed Gateway Transactions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Transactions marked as failed on the Paystack gateway.</p>
          </div>

          <div className="space-y-3">
            {failedTrans.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-semibold">
                No failed gateway transactions recorded.
              </div>
            ) : (
              failedTrans.map((tx, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-gray-400 truncate max-w-[120px]">{tx.ref}</span>
                      <span className="text-gray-300">•</span>
                      <h4 className="text-[12px] font-bold text-slate-800 truncate">{tx.student}</h4>
                    </div>
                    <div className="text-[11px] text-red-500 font-semibold flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="truncate max-w-[200px]">{tx.reason}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 block pt-1 font-mono">Attempt time: {tx.date}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-bold text-slate-900 block font-mono">₦{tx.amount.toLocaleString()}</span>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 uppercase border ${
                      tx.status === 'cancelled'
                        ? 'bg-slate-50 border-slate-100 text-slate-500'
                        : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      {tx.status === 'cancelled' ? 'Cancelled' : 'Declined'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
