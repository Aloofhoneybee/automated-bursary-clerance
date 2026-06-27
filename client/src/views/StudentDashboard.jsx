import React from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';

export default function StudentDashboard({
  studentData,
  transactions,
  feeStructure,
  openCheckout,
  setCurrentTab,
  hostelsList = [],
  refreshDashboard
}) {
  const isCleared = studentData.clearanceStatus === 'Cleared';

  const formatStudentName = (name) => {
    if (!name) return '';
    let lastName = '';
    let firstName = '';

    if (name.includes(',')) {
      const parts = name.split(',');
      lastName = parts[0].trim();
      firstName = parts[1].trim();
    } else {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
      } else {
        lastName = name;
      }
    }

    const capLastName = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase() : '';
    const capFirstName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : '';

    return capFirstName ? `${capLastName} ${capFirstName}` : capLastName;
  };

  const formattedName = formatStudentName(studentData.name);

  // Calculations for Financial Overview
  const paid = studentData.totalPaid;
  
  const baseItems = feeStructure?.feeItems || [
    { description: 'Program Related Fee', amount: 1200000 },
    { description: 'Other Fees', amount: 250000 },
    { description: 'Hostel Fee', amount: 250000 }
  ];

  const { user, setUser } = useAuth();

  const allHostelRatesList = hostelsList.length > 0
    ? hostelsList.map(h => ({ name: h.name, amount: h.amount }))
    : [
        { name: 'Mary & Susanna Hall (Female Only) (Standard)', amount: 250000 },
        { name: 'Elisha Hall (Shared)', amount: 270000 },
        { name: 'En-suite Room (6 bedded)', amount: 300000 },
        { name: 'En-suite Room (4 bedded)', amount: 320000 },
        { name: 'David Hostel (Premium)', amount: 500000 }
      ];

  const hostelRatesList = studentData.gender === 'Male'
    ? allHostelRatesList.filter(h => !h.name.toLowerCase().includes('mary'))
    : allHostelRatesList;

  const defaultHostel = hostelRatesList[0]?.name || 'Elisha Hall (Shared)';
  const initialHostel = user?.hostel || defaultHostel;

  const [selectedHostel, setSelectedHostel] = React.useState(initialHostel);
  const [updatingHostel, setUpdatingHostel] = React.useState(false);

  React.useEffect(() => {
    if (user?.hostel) {
      setSelectedHostel(user.hostel);
    } else {
      setSelectedHostel(defaultHostel);
    }
  }, [user?.hostel, studentData.gender, hostelsList]);

  const handleHostelChange = async (newHostelName) => {
    try {
      setUpdatingHostel(true);
      setSelectedHostel(newHostelName);
      const res = await updateProfile({ hostel: newHostelName });
      if (res.status === 'success') {
        await new Promise(resolve => setTimeout(resolve, 800)); // short artificial delay to show reload animation
        setUser(res.data);
        if (refreshDashboard) {
          refreshDashboard();
        }
      }
    } catch (err) {
      console.error('Failed to update hostel selection:', err);
    } finally {
      setUpdatingHostel(false);
    }
  };

  const selectedHostelObj = hostelRatesList.find(h => h.name === selectedHostel) || hostelRatesList[0];

  const baseWithoutHostel = baseItems.filter(item => !item.description.toLowerCase().includes('hostel'));
  const feeItems = [
    ...baseWithoutHostel,
    {
      description: `Hostel Fee (${selectedHostelObj.name})`,
      amount: selectedHostelObj.amount
    }
  ];

  const total = feeItems.reduce((sum, item) => sum + item.amount, 0);
  const outstanding = Math.max(0, total - paid);

  const latestSuccessTx = transactions.find(t => t.status === 'success');
  const successParts = latestSuccessTx ? latestSuccessTx.date.split(',') : [];
  const lastPaymentDate = successParts.length >= 2 
    ? `${successParts[0]}, ${successParts[1]}`.trim() 
    : (latestSuccessTx ? latestSuccessTx.date : 'N/A');

  const lastPaymentChannel = latestSuccessTx 
    ? (latestSuccessTx.description.includes('Override') ? 'Manual Override' : 'Paystack') 
    : 'N/A';
  const totalSuccessCount = transactions.filter(t => t.status === 'success').length;
  const progressPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <div className="space-y-8 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      {updatingHostel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] flex flex-col items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-2xl flex flex-col items-center gap-4 text-center max-w-[280px]">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">Recalculating Clearance</h4>
              <p className="text-[10px] text-gray-400 mt-1">Updating outstanding balances and clearance requirements.</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Section - Split Layout */}
      <div className="h-auto min-h-[140px] md:h-[240px] rounded-[20px] relative overflow-hidden flex flex-col md:flex-row shadow-[0_8px_24px_rgba(15,23,42,0.05)] border border-gray-250/20">
        
        {/* Left: Solid Green Profile Section */}
        <div className="w-full md:w-[55%] flex-1 bg-gradient-to-r from-[#043a27] to-[#0D9F6E] flex items-center p-4 md:p-[40px] text-white relative z-10 shrink-0">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center font-extrabold text-white text-xl md:text-3xl border-2 border-white/20 uppercase shrink-0">
              {formattedName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <span className="text-[11px] md:text-[14px] text-white/90 font-bold uppercase tracking-[0.08em] block">
                Welcome back,
              </span>
              <h2 className="text-[20px] md:text-[30px] font-bold tracking-tight leading-tight mt-0.5 md:mt-1">{formattedName} </h2>
              <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-0.5 text-[10px] md:text-xs text-white/90 font-medium mt-1 md:mt-2">
                <span>Matric: <b className="text-white font-bold">{studentData.matricNo}</b></span>
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/40" />
                <span>{studentData.programme}</span>
                {studentData.level && (
                  <>
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/40" />
                    <span>{studentData.level}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Transition Feather Blend (anchored to the right edge of the green section) */}
          <div className="hidden md:block absolute left-full -ml-1 top-0 bottom-0 w-[150px] bg-gradient-to-r from-[#0D9F6E] via-[#0D9F6E]/80 to-transparent z-20 pointer-events-none" />
        </div>
 
        {/* Right: Campus Image Section */}
        <div 
          className="hidden md:block flex-1 bg-cover bg-right-top relative"
          style={{ backgroundImage: `url('/caleb-campus.png')` }}
        >
          {/* Subtle green overlay on right part to tie it visually */}
          <div className="absolute inset-0 bg-[#043a27]/10 z-0" />
        </div>
      </div>

      {/* Clearance Module Success Panel (Visible only when cleared) */}
      {isCleared && (
        <div className="bg-[#ECFDF5] border border-success/20 rounded-[20px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-14 h-14 rounded-2xl bg-success/15 flex items-center justify-center text-success border border-success/10 shrink-0">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-955">
                {studentData.clearanceScope === 'first_semester'
                  ? 'First Semester Clearance Approved'
                  : 'Full Session Clearance Approved'}
              </h3>
              <p className="text-sm text-[#065F46] mt-0.5">
                {studentData.clearanceScope === 'first_semester'
                  ? 'You are cleared for first semester exams and activities. To continue in the second semester, please pay the remaining 50% outstanding balance.'
                  : 'You have successfully completed bursary clearance for the full academic session.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setCurrentTab('certificate')}
              className="flex-1 md:flex-initial h-[46px] px-5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Certificate
            </button>
            <button
              onClick={() => setCurrentTab('verify')}
              className="flex-1 md:flex-initial h-[46px] px-5 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verify Certificate
            </button>
          </div>
        </div>
      )}

      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Total Balance */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-4 md:p-6 flex justify-between items-center hover:-translate-y-1 transition-all duration-200 group col-span-1">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Total Balance</span>
            <h3 className="text-base md:text-xl font-bold text-secondary">₦{studentData.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <span className="inline-block px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 rounded-md text-[10px] font-semibold">
              Outstanding
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-all shrink-0 hidden sm:flex">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Paid */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-4 md:p-6 flex justify-between items-center hover:-translate-y-1 transition-all duration-200 group col-span-1">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Total Paid</span>
            <h3 className="text-base md:text-xl font-bold text-secondary">₦{studentData.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <span className="inline-block px-2 py-0.5 bg-green-50 border border-green-100 text-primary rounded-md text-[10px] font-semibold">
              Paid
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-all shrink-0 hidden sm:flex">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Clearance Status */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-4 md:p-6 flex justify-between items-center hover:-translate-y-1 transition-all duration-200 group col-span-1">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Clearance Status</span>
            <h3 className={`text-base md:text-xl font-bold ${isCleared ? 'text-primary' : 'text-slate-900'}`}>
              {isCleared 
                ? (studentData.clearanceScope === 'first_semester' ? 'Cleared (1st Sem)' : 'Cleared (Full)') 
                : studentData.clearanceStatus}
            </h3>
            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${isCleared
              ? 'bg-green-50 border-green-100 text-primary'
              : 'bg-orange-50 border-orange-100 text-orange-600'
              }`}>
              {isCleared 
                ? (studentData.clearanceScope === 'first_semester' ? 'First Semester Only' : 'Full Session')
                : 'Pending Payments'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-all shrink-0 hidden sm:flex">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Academic Session */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-4 md:p-6 flex justify-between items-center hover:-translate-y-1 transition-all duration-200 group col-span-1">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Academic Session</span>
            <h3 className="text-base md:text-xl font-bold text-secondary">{studentData.session}</h3>
            <span className="inline-block px-2 py-0.5 bg-green-50 border border-green-100 text-primary rounded-md text-[10px] font-semibold">
              Current Session
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-all shrink-0 hidden sm:flex">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Row 2: Financial Overview (Left) and Stack of Transactions & Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-6">
        {/* Left Column: Financial Overview Card (lg:col-span-6 / 50% width) */}
        <div className="lg:col-span-6 bg-white rounded-[24px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-4 md:p-8 flex flex-col justify-between h-full min-h-[500px]">

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Financial Overview</h3>
              <p className="text-[12px] text-gray-500 mt-1">Breakdown of your current academic session fees</p>
            </div>
            <button 
              onClick={() => setCurrentTab('fee-structure')}
              className="text-[12px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              View Details 
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Fees Details Container */}
          <div className="border border-gray-150 bg-white rounded-[20px] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.03)] space-y-5">
            {/* Fees Breakdown */}
            <div className="space-y-2">
              {feeItems.map((item, idx) => {
                const isHostel = item.description.toLowerCase().includes('hostel');
                return (
                  <div key={idx} className="flex justify-between items-center py-0.5 border-b border-gray-50/50">
                    {isHostel ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-gray-500">Hostel Fee</span>
                        <select
                          value={selectedHostel}
                          onChange={(e) => handleHostelChange(e.target.value)}
                          className="h-7 rounded-lg px-2 bg-gray-55 text-[11px] font-bold text-slate-700 border border-gray-250 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm cursor-pointer py-0"
                        >
                          {hostelRatesList.map(h => (
                            <option key={h.name} value={h.name}>
                              {h.name.replace(' Hostel', '').replace(' Hall', '')}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-[13px] font-medium text-gray-500">{item.description}</span>
                    )}
                    <span className="text-[14px] font-bold text-slate-700 font-mono">₦{item.amount.toLocaleString()}</span>
                  </div>
                );
              })}
              <div className="flex justify-between items-center py-1 border-b border-gray-50 pt-2">
                <span className="text-[13px] font-bold text-slate-900">Total School Fees</span>
                <span className="text-[15px] font-extrabold text-slate-950 font-mono">₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-[13px] font-medium text-gray-500">Amount Paid</span>
                <span className="text-[15px] font-bold text-primary font-mono">₦{paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-[13px] font-medium text-gray-500">Outstanding Balance</span>
                <span className="text-[15px] font-bold text-slate-800 font-mono">₦{outstanding.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Payment Progress</span>
                <span className="text-xs font-bold text-primary">{progressPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Info Cells Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Cell 1: Last Payment */}
            <div className="flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-[16px]">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Last Payment</span>
                <span className="text-[12px] font-bold text-slate-800">{lastPaymentDate}</span>
              </div>
            </div>

            {/* Cell 2: Academic Session */}
            <div className="flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-[16px]">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Academic Session</span>
                <span className="text-[12px] font-bold text-slate-800">{studentData.session || 'N/A'}</span>
              </div>
            </div>

            {/* Cell 3: Payment Method */}
            <div className="flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-[16px]">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Payment Method</span>
                <span className="text-[12px] font-bold text-slate-800">{lastPaymentChannel}</span>
              </div>
            </div>

            {/* Cell 4: Total Transactions */}
            <div className="flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-[16px]">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-medium block">Total Transactions</span>
                <span className="text-[12px] font-bold text-slate-800">{totalSuccessCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stack of Recent Transactions & Quick Actions (lg:col-span-6 / 50% width) */}
        <div className="lg:col-span-6 flex flex-col gap-6 justify-between h-full">
          {/* Top: Recent Transactions Card */}
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-4 md:p-8 flex flex-col justify-between flex-1">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
                  <p className="text-[12px] text-gray-500 mt-1">Audit trail of recent payments</p>
                </div>
                <button 
                  onClick={() => setCurrentTab('history')}
                  className="text-[12px] font-bold text-primary hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="h-[200px] flex flex-col items-center justify-center text-center text-gray-400">
                    <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                    <p className="text-xs font-semibold">No transactions recorded yet</p>
                  </div>
                ) : (
                  transactions.slice(0, 3).map((tx, idx) => {
                    const isSuccess = tx.status === 'success';
                    const isFailed = tx.status === 'failed';
                    const isCancelled = tx.status === 'cancelled';

                    let statusText = 'PENDING';
                    let statusColorClass = 'bg-orange-50 border-orange-100 text-orange-600';
                    let iconBgClass = 'bg-orange-50 text-orange-500';
                    
                    if (isSuccess) {
                      statusText = 'SUCCESS';
                      statusColorClass = 'bg-green-50 border-green-100 text-primary';
                      iconBgClass = 'bg-green-50 text-primary';
                    } else if (isFailed) {
                      statusText = 'FAILED';
                      statusColorClass = 'bg-red-50 border-red-100 text-danger';
                      iconBgClass = 'bg-red-50 text-danger';
                    } else if (isCancelled) {
                      statusText = 'CANCELLED';
                      statusColorClass = 'bg-slate-100 border-slate-200 text-slate-500';
                      iconBgClass = 'bg-slate-100 text-slate-500';
                    }

                    return (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-colors flex justify-between items-start gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[12px] font-bold text-slate-800 truncate">{tx.description}</h4>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">Ref: {tx.ref}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{tx.date}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[13px] font-extrabold text-slate-900 block font-mono">
                            ₦{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className={`inline-block text-[9px] font-bold mt-1 px-2 py-0.5 rounded-md border uppercase tracking-wide ${statusColorClass}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setCurrentTab('history')}
                className="w-full h-12 rounded-xl bg-gray-50 hover:bg-gray-100 text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-100"
              >
                View All Transactions
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom: Quick Actions Card */}
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-4 md:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Quick Actions</h3>
              <p className="text-[12px] text-gray-500 mt-1">Quick access to bursary functions</p>
            </div>

            {/* 3-Column Grid Action Cards (Wraps cleanly on small columns) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {/* Action 1: Pay Fees */}
              <div
                onClick={() => openCheckout(outstanding)}
                className="bg-white border border-slate-200 hover:border-primary hover:shadow-[0_8px_20px_rgba(5,150,105,0.15)] rounded-[18px] p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col items-center gap-3 group text-center w-full"
              >
                <div className="w-[44px] h-[44px] rounded-[12px] bg-[#ECFDF5] text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-slate-900 group-hover:text-primary transition-colors truncate">Pay Fees</h4>
                  <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">Make fee payments</p>
                </div>
              </div>

              {/* Action 2: Payment History */}
              <div
                onClick={() => setCurrentTab('history')}
                className="bg-white border border-slate-200 hover:border-primary hover:shadow-[0_8px_20px_rgba(5,150,105,0.15)] rounded-[18px] p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col items-center gap-3 group text-center w-full"
              >
                <div className="w-[44px] h-[44px] rounded-[12px] bg-[#ECFDF5] text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-slate-900 group-hover:text-primary transition-colors truncate">History</h4>
                  <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">View transactions</p>
                </div>
              </div>

              {/* Action 3: My Clearance */}
              <div
                onClick={() => setCurrentTab('clearance')}
                className="bg-white border border-slate-200 hover:border-primary hover:shadow-[0_8px_20px_rgba(5,150,105,0.15)] rounded-[18px] p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col items-center gap-3 group text-center w-full"
              >
                <div className="w-[44px] h-[44px] rounded-[12px] bg-[#ECFDF5] text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-slate-900 group-hover:text-primary transition-colors truncate">My Clearance</h4>
                  <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">Clearance status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}