import React, { useState, useEffect } from 'react';
import { getAllTransactions, verifyPayment } from '../api/payments';

export default function DisputesView() {
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [resolvingRef, setResolvingRef] = useState(null);

  const loadData = () => {
    setLoading(true);
    getAllTransactions()
      .then((res) => {
        // Real dispute tickets are transactions that are not fully cleared ('success')
        const allTx = res.data || [];
        const unresolved = allTx.filter(t => t.status !== 'success');
        setDisputes(unresolved);
      })
      .catch((err) => {
        console.error('Failed to load dispute queue:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (reference) => {
    setResolvingRef(reference);
    try {
      const res = await verifyPayment(reference);
      if (res.status === 'success' || res.data?.status === 'success') {
        alert(`Dispute Resolved: Transaction reference ${reference} has been successfully verified with the gateway and updated to Success!`);
      } else {
        alert(`Gateway status: ${res.message || 'Payment not completed or failed.'}`);
      }
      loadData();
    } catch (err) {
      alert(`Verification Failed: ${err.response?.data?.message || err.message || 'Unable to reconcile transaction.'}`);
    } finally {
      setResolvingRef(null);
    }
  };

  const filteredDisputes = disputes.filter((item) => {
    const studentName = item.student?.fullName || '';
    const studentMatric = item.student?.matricNumber || '';
    const reference = item.paystackReference || '';

    const matchesSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      studentMatric.toLowerCase().includes(search.toLowerCase()) ||
      reference.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      item.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">Dispute Reconciliation Queue</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time reconciliation queue for pending, failed, or unreconciled gateway payments.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="group h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-gray-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] hover:scale-[1.02] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className={`w-4 h-4 text-gray-400 group-hover:text-slate-600 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-all duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh Queue
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, matric number or payment reference..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 focus:outline-none cursor-pointer"
          >
            <option value="All">All Unresolved</option>
            <option value="Pending">Pending Verification</option>
            <option value="Failed">Failed attempts</option>
            <option value="Cancelled">Cancelled checkout</option>
          </select>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[24px] border border-gray-200 overflow-hidden shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-semibold">Loading real-time dispute queue...</p>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Queue is Clear</h4>
              <p className="text-xs text-gray-400 max-w-[280px] mx-auto">No unreconciled or pending disputes found matching the selected filters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-200">
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Reference & Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDisputes.map((item) => {
                  const isPending = item.status === 'pending';
                  const isFailed = item.status === 'failed';
                  const isCancelled = item.status === 'cancelled';

                  let badgeColorClass = 'bg-orange-50 border-orange-100 text-orange-600';
                  let statusText = 'Pending verification';

                  if (isFailed) {
                    badgeColorClass = 'bg-red-50 border-red-100 text-red-600';
                    statusText = 'Declined';
                  } else if (isCancelled) {
                    badgeColorClass = 'bg-slate-100 border-slate-200 text-slate-500';
                    statusText = 'Cancelled';
                  }

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Student Details */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{item.student?.fullName || 'Unknown'}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">Matric: {item.student?.matricNumber || 'N/A'}</div>
                      </td>

                      {/* Reference & Date */}
                      <td className="px-6 py-4 font-medium">
                        <div className="font-mono text-[11px] text-slate-600">{item.paystackReference}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-mono font-extrabold text-slate-900">
                        ₦{item.amount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${badgeColorClass}`}>
                          {statusText}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleResolve(item.paystackReference)}
                          disabled={resolvingRef === item.paystackReference}
                          className="h-8 px-4 bg-primary hover:bg-primary-dark text-white disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          {resolvingRef === item.paystackReference ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              Verify & Resolve
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
