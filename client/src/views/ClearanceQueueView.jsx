import React, { useState, useEffect } from 'react';
import { getAllClearances, overrideClearance } from '../api/clearance';
import { getAllUsers } from '../api/users';
import { getAllTransactions } from '../api/payments';
import { getAllFees } from '../api/fees';
import { getAllHostels } from '../api/hostels';

export default function ClearanceQueueView({ currentRole }) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [clearances, setClearances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fees, setFees] = useState([]);
  const [hostels, setHostels] = useState([]);

  // Search/Filter states
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected student for details/override modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('cleared');
  const [overrideScope, setOverrideScope] = useState('full');
  const [overrideComment, setOverrideComment] = useState('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getAllUsers('student'),
      getAllClearances(),
      getAllTransactions(),
      getAllFees(),
      getAllHostels()
    ])
      .then(([usersRes, clearancesRes, txsRes, feesRes, hostelsRes]) => {
        setStudents(usersRes.data || []);
        setClearances(clearancesRes.data || []);
        setTransactions(txsRes.data || []);
        setFees(feesRes.data || []);
        setHostels(hostelsRes.data || []);
      })
      .catch((err) => {
        console.error('Failed to load clearance queue data:', err);
        alert(err.message || 'Failed to load clearance queue data');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Process students with fee and payment info
  const processedQueue = students.map(student => {
    // Find matching fee structure
    // Match by session, department, and category (level)
    const matchingFee = fees.find(f => 
      f.academicSession === (student.academicSession || '2025/2026') &&
      f.department === (student.department || 'Computer Science') &&
      f.studentCategory === (student.level || '100 Level')
    ) || fees.find(f => 
      f.academicSession === (student.academicSession || '2025/2026') &&
      f.department === (student.department || 'Computer Science')
    );

    // Find the student's selected hostel or gender-based default
    const defaultHostelName = student.gender === 'Female' 
      ? 'Mary & Susanna Hall (Female Only) (Standard)'
      : 'Elisha Hall (Shared)';
    const selectedHostelName = student.hostel || defaultHostelName;
    const studentHostel = hostels.find(h => h.name === selectedHostelName);
    const hostelAmount = studentHostel ? studentHostel.amount : (student.gender === 'Female' ? 250000 : 270000);

    // Sum student's successful transactions
    const studentTxs = transactions.filter(t => 
      t.student?._id === student._id && t.status === 'success'
    );
    const totalPaid = studentTxs.reduce((sum, t) => sum + t.amount, 0);

    const baseFeeAmount = matchingFee ? matchingFee.totalAmount : 1450000;
    const totalRequired = baseFeeAmount + hostelAmount;
    const outstanding = Math.max(0, totalRequired - totalPaid);

    // Find clearance record
    const clearance = clearances.find(c => c.student?._id === student._id);
    const clearanceStatus = clearance ? clearance.status : (outstanding <= 0 ? 'cleared' : 'not_cleared');

    return {
      ...student,
      totalPaid,
      totalRequired,
      outstanding,
      clearanceStatus,
      clearanceRecord: clearance,
      transactionsList: transactions.filter(t => t.student?._id === student._id)
    };
  });

  // Apply filters
  const filteredQueue = processedQueue.filter(item => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (item.matricNumber && item.matricNumber.toLowerCase().includes(search.toLowerCase())) ||
      item.email.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'All' || item.department === deptFilter;
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = item.clearanceStatus === statusFilter;
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenOverride = (student) => {
    setSelectedStudent(student);
    setOverrideStatus(student.clearanceStatus === 'cleared' ? 'not_cleared' : 'cleared');
    setOverrideScope(student.clearanceRecord?.scope || 'full');
    setOverrideComment('');
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
  };

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    if (!overrideComment.trim()) return;

    setSubmittingOverride(true);
    overrideClearance(
      selectedStudent._id,
      overrideStatus,
      overrideComment,
      overrideStatus === 'cleared' ? overrideScope : undefined
    )
      .then((res) => {
        alert(`Clearance status updated to ${overrideStatus} for ${selectedStudent.fullName}`);
        handleCloseModal();
        loadData(); // reload
      })
      .catch((err) => {
        alert(err.message || 'Failed to update clearance status');
      })
      .finally(() => {
        setSubmittingOverride(false);
      });
  };

  const deptsList = ['All', 'Computer Science', 'Mass Communication', 'Law', 'Microbiology', 'Accounting', 'Architecture'];

  if (loading && processedQueue.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-gray-505 font-semibold">Loading student clearance queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">Clearance Validation Pipeline</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time audit log of student payments, balance reconciliation, and clearance certificates.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="group h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-gray-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] hover:scale-[1.02] flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
        >
          <svg className={`w-4 h-4 text-gray-400 group-hover:text-slate-600 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-all duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.02)]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, matric number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-xs font-medium placeholder-gray-400 bg-gray-50/50 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department */}
          <div className="flex items-center gap-2 bg-gray-50/50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <span className="text-gray-450 uppercase text-[9px] tracking-wider">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-slate-800 cursor-pointer"
            >
              {deptsList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Clearance Status */}
          <div className="flex items-center gap-2 bg-gray-50/50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <span className="text-gray-450 uppercase text-[9px] tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="All">All</option>
              <option value="cleared">Cleared</option>
              <option value="not_cleared">Not Cleared</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[20px] border border-gray-200 overflow-x-auto shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
        <table className="w-full text-[13px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-150">
              <th className="px-6 py-4">Student Details</th>
              <th className="px-6 py-4">Department & Level</th>
              <th className="px-6 py-4 text-right">Required (₦)</th>
              <th className="px-6 py-4 text-right">Total Paid (₦)</th>
              <th className="px-6 py-4 text-right">Outstanding (₦)</th>
              <th className="px-6 py-4 text-center">Clearance Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredQueue.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-xs text-gray-400 font-semibold">
                  No student clearance records matched the filter query.
                </td>
              </tr>
            ) : (
              filteredQueue.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Student details */}
                  <td className="px-6 py-4">
                    <div>
                      <h4 className="font-bold text-slate-800 capitalize">{item.fullName}</h4>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{item.matricNumber || 'No Matric'}</span>
                      <span className="text-gray-300 mx-1.5">•</span>
                      <span className="text-[10px] text-gray-400 font-medium">{item.email}</span>
                    </div>
                  </td>

                  {/* Dept & Level */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700 block text-xs">{item.department || 'Computer Science'}</span>
                    <span className="text-[10px] text-gray-400 font-bold block pt-0.5">{item.level || '100 Level'}</span>
                  </td>

                  {/* Required */}
                  <td className="px-6 py-4 text-right font-semibold text-slate-700 font-mono">
                    {item.totalRequired.toLocaleString()}
                  </td>

                  {/* Paid */}
                  <td className="px-6 py-4 text-right font-bold text-primary font-mono">
                    {item.totalPaid.toLocaleString()}
                  </td>

                  {/* Outstanding */}
                  <td className="px-6 py-4 text-right font-extrabold font-mono text-slate-900">
                    <span className={item.outstanding > 0 ? 'text-red-500' : 'text-primary'}>
                      {item.outstanding.toLocaleString()}
                    </span>
                  </td>

                  {/* Clearance status */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase ${
                      item.clearanceStatus === 'cleared'
                        ? 'bg-primary-light border-primary/10 text-primary'
                        : 'bg-red-50 border-red-100 text-red-650'
                    }`}>
                      {item.clearanceStatus === 'cleared' ? 'Cleared' : 'Not Cleared'}
                    </span>
                    {item.clearanceRecord?.staffOverride?.overriddenBy && (
                      <span className="block text-[8px] text-orange-500 font-bold pt-1 uppercase tracking-wider">
                        Overridden
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenOverride(item)}
                        className="h-7 px-3 border border-gray-250 hover:bg-gray-50 text-slate-700 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Manual Override
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Override Dialog Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-gray-200 w-full max-w-md shadow-2xl p-6 relative flex flex-col space-y-4 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-extrabold text-secondary tracking-tight">Manual Status Override</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Manually enforce or revoke clearance for: <strong className="capitalize text-slate-800">{selectedStudent.fullName}</strong></p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-7 h-7 bg-gray-50 hover:bg-gray-100 border border-gray-150 text-gray-500 rounded-full flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between"><span>Matric Number:</span><span className="font-mono font-bold uppercase">{selectedStudent.matricNumber || 'No Matric'}</span></div>
              <div className="flex justify-between"><span>Outstanding Balance:</span><span className="font-mono font-bold text-red-500">₦{selectedStudent.outstanding.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Automatic Clearance:</span><span className="font-bold uppercase text-[10px]">{selectedStudent.outstanding <= 0 ? 'Approved' : 'Awaiting Payment'}</span></div>
            </div>

            {/* Override Form */}
            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              {/* Select Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">Target Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  <option value="cleared">Enforce: Cleared</option>
                  <option value="not_cleared">Revoke: Not Cleared</option>
                </select>
              </div>

              {/* Select Scope (Only if status is cleared) */}
              {overrideStatus === 'cleared' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">Clearance Scope</label>
                  <select
                    value={overrideScope}
                    onChange={(e) => setOverrideScope(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  >
                    <option value="full">Full Session Clearance</option>
                    <option value="first_semester">First Semester Only Clearance</option>
                  </select>
                </div>
              )}

              {/* Comment - MANDATORY */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">Mandatory Comment / Reason</label>
                <textarea
                  rows="3"
                  placeholder="Explain why this status is manually overridden (e.g. cash reconciliation, bursary dispute resolved)..."
                  value={overrideComment}
                  onChange={(e) => setOverrideComment(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-xs font-medium bg-gray-50/50"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submittingOverride || !overrideComment.trim()}
                className={`w-full h-10 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center ${
                  !overrideComment.trim() || submittingOverride
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-primary hover:bg-primary-dark text-white shadow-primary/10'
                }`}
              >
                {submittingOverride ? 'Updating status...' : 'Submit Override Action'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
