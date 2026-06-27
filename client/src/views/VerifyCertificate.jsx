import React, { useState } from 'react';
import { verifyCertificate } from '../api/clearance';

export default function VerifyCertificate({ studentData }) {
  const [certId, setCertId] = useState('');
  const [searchResult, setSearchResult] = useState(null); // 'found', 'not-found', 'loading', null
  const [searchedId, setSearchedId] = useState('');
  const [verifiedData, setVerifiedData] = useState(null);

  const activeToken = studentData.verificationToken || '';
  const isStudentCleared = studentData.clearanceStatus === 'Cleared' && activeToken;

  const handleVerify = (e) => {
    e.preventDefault();
    const query = certId.trim();
    if (!query) return;

    setSearchedId(query);
    setSearchResult('loading');

    verifyCertificate(query)
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setVerifiedData(res.data);
          setSearchResult('found');
        } else {
          setSearchResult('not-found');
        }
      })
      .catch(() => {
        setSearchResult('not-found');
      });
  };

  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-secondary tracking-tight">Certificate Verification</h1>
        <p className="text-xs text-gray-500 mt-1">Verify official Caleb University bursary clearance certificate authenticity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_2fr] gap-6">
        
        {/* Verification Form (Left) */}
        <div className="bg-white rounded-[20px] border border-gray-200 p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] space-y-4 h-fit">
          <div>
            <h3 className="text-[15px] font-bold text-secondary">Verify Authenticity</h3>
            <p className="text-xs text-gray-400 mt-0.5">Enter the Certificate Security ID displayed on the clearance certificate.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block">Certificate ID / Token</label>
              <input
                type="text"
                required
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="w-full h-11 px-3.5 bg-gray-50 text-[13px] text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white transition-all font-mono"
                placeholder="e.g. 2f0af576-cfc2-..."
              />
            </div>

            {/* Helpful Copy-Paste hint */}
            {isStudentCleared && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-[11px] leading-relaxed">
                <span className="text-gray-400 block font-semibold">Active Student Certificate Token:</span>
                <span 
                  onClick={() => setCertId(activeToken)}
                  className="font-mono font-bold text-primary cursor-pointer hover:underline block pt-0.5 select-all break-all"
                  title="Click to copy into search"
                >
                  {activeToken}
                </span>
                <span className="text-[9px] text-gray-400 block pt-1">(Click the ID above to copy it into the input field)</span>
              </div>
            )}

            <button
              type="submit"
              disabled={searchResult === 'loading'}
              className="w-full h-11 bg-primary hover:bg-primary-dark text-white rounded-xl text-[12px] font-bold shadow-sm transition-all"
            >
              {searchResult === 'loading' ? 'Verifying...' : 'Verify Registry'}
            </button>
          </form>
        </div>

        {/* Results Panel (Right) */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-8 min-h-[300px] flex flex-col items-center justify-center">
          {searchResult === null && (
            <div className="text-center text-gray-400 max-w-[320px] space-y-3">
              <div className="w-14 h-14 bg-gray-50 border border-gray-150 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Awaiting Validation Request</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Input a valid certificate security identifier code on the left to query the institutional database registry.</p>
              </div>
            </div>
          )}

          {searchResult === 'loading' && (
            <div className="text-center text-gray-400 space-y-3">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Contacting Caleb University registry database...</p>
            </div>
          )}

          {searchResult === 'found' && verifiedData && (
            <div className="w-full space-y-6 animate-in zoom-in-95 duration-200">
              {/* Green verify banner */}
              <div className="p-4 bg-green-50 border border-success/20 rounded-2xl flex items-center gap-4 text-[#065F46]">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success border border-success/10 shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold">Authenticity Confirmed</h4>
                  <p className="text-[11px] text-[#065F46]/85 font-medium mt-0.5">This certificate matches an active, authorized bursary clearance record.</p>
                </div>
              </div>

              {/* Student Metadata Table */}
              <div className="border border-gray-150 rounded-2xl overflow-hidden text-[13px]">
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-150 font-bold text-secondary uppercase tracking-wider text-[10px]">
                  Clearance Details
                </div>
                <div className="divide-y divide-gray-100 p-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between px-3 py-3 gap-1 sm:gap-4"><span className="text-gray-400 shrink-0">Student Name:</span><span className="font-bold text-slate-800 text-right sm:text-left">{verifiedData.fullName ? verifiedData.fullName.replace(/,/g, '').replace(/\s+/g, ' ').trim() : ''}</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between px-3 py-3 gap-1 sm:gap-4"><span className="text-gray-400 shrink-0">Matric Number:</span><span className="font-bold text-slate-800 font-mono text-right sm:text-left">{verifiedData.matricNumber}</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between px-3 py-3 gap-1 sm:gap-4"><span className="text-gray-400 shrink-0">Department / Program:</span><span className="font-bold text-slate-800 text-right sm:text-left">{verifiedData.department}</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between px-3 py-3 gap-1 sm:gap-4"><span className="text-gray-400 shrink-0">Clearance Session:</span><span className="font-bold text-slate-800 text-right sm:text-left">{verifiedData.academicSession}</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between px-3 py-3 gap-1 sm:gap-4"><span className="text-gray-400 shrink-0">Security Certificate ID:</span><span className="font-bold text-slate-800 font-mono text-xs break-all text-right sm:text-left">{verifiedData.verificationToken}</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between px-3 py-3 gap-1 sm:gap-4"><span className="text-gray-400 shrink-0">Clearance Date:</span><span className="font-bold text-slate-800 text-right sm:text-left">{new Date(verifiedData.clearedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between px-3 py-3 gap-1 sm:gap-4">
                    <span className="text-gray-400 shrink-0">Status:</span>
                    <span className="font-extrabold text-primary uppercase text-right sm:text-left">
                      {verifiedData.scope === 'first_semester' ? 'Cleared (First Semester Only)' : 'Cleared (Full Session)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {searchResult === 'not-found' && (
            <div className="text-center max-w-[360px] space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-red-50 border border-red-150 rounded-full flex items-center justify-center mx-auto text-danger">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">No Record Found</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  We could not locate any active bursary clearance certificate with ID: <b className="font-mono text-danger block mt-1 break-all">{searchedId}</b>
                </p>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">Please double-check the spelling, check uppercase letters, or contact the university bursary IT helpdesk.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
