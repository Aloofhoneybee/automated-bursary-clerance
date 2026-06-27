const fs = require('fs');
const path = 'c:/Users/admin/OneDrive/Desktop/Automated busary clearance/src/views/StudentDashboard.jsx';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

const before = lines.slice(0, 102);
const after = lines.slice(479);

const newContent = `      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Row 1: Stats Cards */}
        {/* Card 1: Total Balance */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-6 flex justify-between items-center hover:-translate-y-1 transition-all duration-200 group col-span-1">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Total Balance</span>
            <h3 className="text-xl font-bold text-secondary">₦{studentData.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <span className="inline-block px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 rounded-md text-[10px] font-semibold">
              Outstanding
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-all shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Paid */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-6 flex justify-between items-center hover:-translate-y-1 transition-all duration-200 group col-span-1">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Total Paid</span>
            <h3 className="text-xl font-bold text-secondary">₦{studentData.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <span className="inline-block px-2 py-0.5 bg-green-50 border border-green-100 text-primary rounded-md text-[10px] font-semibold">
              Paid
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-all shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Clearance Status */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-6 flex justify-between items-center hover:-translate-y-1 transition-all duration-200 group col-span-1">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Clearance Status</span>
            <h3 className={\`text-xl font-bold \${isCleared ? 'text-primary' : 'text-slate-900'}\`}>{studentData.clearanceStatus}</h3>
            <span className={\`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border \${isCleared
              ? 'bg-green-50 border-green-100 text-primary'
              : 'bg-orange-50 border-orange-100 text-orange-600'
              }\`}>
              {isCleared ? 'Cleared' : 'Pending Payments'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-all shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Academic Session */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-6 flex justify-between items-center hover:-translate-y-1 transition-all duration-200 group col-span-1">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Academic Session</span>
            <h3 className="text-xl font-bold text-secondary">{studentData.session}</h3>
            <span className="inline-block px-2 py-0.5 bg-green-50 border border-green-100 text-primary rounded-md text-[10px] font-semibold">
              Current Session
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-all shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Row 2: Fee Advisory and Recent Transactions */}
        {/* Card: Fee Payment Advisory */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-6 flex flex-col justify-between min-h-[340px] col-span-1 md:col-span-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
                Fee Payment Advisory
                <svg className="w-4.5 h-4.5 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </h3>
              <p className="text-xs text-gray-500 mt-1">All undergraduate and Post Graduate students are advised to pay their School fees into the following University bank accounts:</p>
            </div>

            {/* Account boxes with official logos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account 1: Ecobank */}
              <div className="p-4 bg-gray-50 rounded-[20px] border border-gray-150 flex flex-col justify-between h-[110px] hover:bg-gray-100/50 transition-colors">
                <div className="flex items-center justify-between">
                  <img
                    src="/ecobank-logo.png"
                    alt="Ecobank Logo"
                    className="w-[90px] h-auto object-contain"
                  />
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Ecobank</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-base font-extrabold text-secondary font-mono tracking-wide">1993000883</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText('1993000883'); alert('Ecobank account number copied!'); }}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-md transition-all shrink-0"
                    title="Copy account number"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Account 2: Sterling Bank */}
              <div className="p-4 bg-gray-50 rounded-[20px] border border-gray-150 flex flex-col justify-between h-[110px] hover:bg-gray-100/50 transition-colors">
                <div className="flex items-center justify-between">
                  <img
                    src="/sterling-logo.png"
                    alt="Sterling Bank Logo"
                    className="w-[90px] h-auto object-contain"
                  />
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Sterling Bank</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-base font-extrabold text-secondary font-mono tracking-wide">0020022195</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText('0020022195'); alert('Sterling Bank account number copied!'); }}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-md transition-all shrink-0"
                    title="Copy account number"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-normal">
              All students in Caleb Business School should pay their School fees into EcoBank No. <span className="font-bold text-primary font-mono select-text">1992514288</span>
            </p>
          </div>

          {/* Action Note */}
          <div className="flex items-center justify-between gap-4 p-3 border border-primary/20 bg-primary-light/50 rounded-xl text-[11px] text-[#065F46] font-medium mt-4 shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>After payment, upload scanned copy of your payment evidence.</span>
            </div>
            <button
              onClick={openEvidence}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-all shadow-sm shrink-0"
            >
              Upload Evidence
            </button>
          </div>
        </div>

        {/* Card: Recent Transactions */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-6 flex flex-col justify-between min-h-[340px] col-span-1 md:col-span-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[15px] font-bold text-secondary">Recent Transactions</h3>
              <button
                onClick={() => setCurrentTab('history')}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {transactions.slice(0, 3).map((tx, idx) => {
                const isCredit = tx.type === 'credit';
                const isSuccess = tx.status === 'success';
                const isFailed = tx.status === 'failed';

                return (
                  <div
                    key={idx}
                    className="h-[72px] flex items-center justify-between px-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={\`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 \${isSuccess
                        ? 'bg-green-50 text-primary'
                        : isFailed
                          ? 'bg-red-50 text-danger'
                          : 'bg-orange-50 text-warning'
                        }\`}>
                        {isCredit ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[12px] font-bold text-slate-800 truncate">{tx.description}</h4>
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5 truncate">{tx.ref}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-[12px] font-bold text-slate-900 block">
                        ₦{tx.amount.toLocaleString()}
                      </span>
                      <span className={\`inline-block text-[9px] font-bold mt-0.5 uppercase tracking-wide \${isSuccess ? 'text-primary' : isFailed ? 'text-danger' : 'text-orange-500'
                        }\`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Fee Summary and Quick Actions */}
        {/* Card: Fee Summary (Donut Chart) */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-6 flex items-center justify-between gap-6 h-[220px] col-span-1 md:col-span-2">
          {/* Donut Chart Container (LEFT, Vertically Centered, size 180x180 px) */}
          <div className="relative w-[180px] h-[180px] flex items-center justify-center shrink-0">
            <svg className="w-[180px] h-[180px] transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="18"
              />

              {/* Paid Stroke (Green) */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke="var(--color-primary)"
                strokeWidth="18"
                strokeDasharray={circumference}
                strokeDashoffset={0}
              />

              {/* Outstanding Stroke (Orange/Yellow) */}
              {outstanding > 0 && (
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="18"
                  strokeDasharray={circumference}
                  strokeDashoffset={paidStroke}
                />
              )}
            </svg>

            {/* Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Fees</span>
              <span className="text-[15px] font-black text-secondary mt-0.5">₦{(total / 1000).toFixed(1)}k</span>
            </div>
          </div>

          {/* Legend Details List (RIGHT) */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center"><h3 className="text-[14px] font-bold text-secondary">Summary</h3><span onClick={() => setCurrentTab('fee-structure')} className="text-[10px] text-primary hover:underline cursor-pointer font-bold">Details</span></div>
            <div className="mt-4 space-y-2.5">
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="text-gray-500 font-medium">Total Fees</span>
                </div>
                <span className="font-extrabold text-slate-850 font-mono">₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-gray-500 font-medium">Paid</span>
                </div>
                <span className="font-extrabold text-slate-850 font-mono">₦{paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-gray-500 font-medium">Outstanding</span>
                </div>
                <span className="font-extrabold text-slate-850 font-mono">₦{outstanding.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Quick Actions */}
        <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] p-6 flex flex-col justify-between h-[220px] col-span-1 md:col-span-2">
          <div>
            <h3 className="text-[15px] font-bold text-secondary">Quick Actions</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Quick access to bursary functions</p>
          </div>

          {/* Grid Action Bar */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 py-1">
            {/* Action 1: Pay Fees */}
            <button
              onClick={openCheckout}
              className="w-full h-[110px] border border-gray-150 hover:border-primary/30 hover:bg-primary-light/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-0.5 duration-200 group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800">Pay Fees</span>
            </button>

            {/* Action 2: Upload Evidence */}
            <button
              onClick={openEvidence}
              className="w-full h-[110px] border border-gray-150 hover:border-primary/30 hover:bg-primary-light/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-0.5 duration-200 group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800">Upload Evidence</span>
            </button>

            {/* Action 3: Invoice */}
            <button
              onClick={() => setCurrentTab('invoices')}
              className="w-full h-[110px] border border-gray-150 hover:border-primary/30 hover:bg-primary-light/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-0.5 duration-200 group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800">Invoice</span>
            </button>

            {/* Action 4: My Clearance */}
            <button
              onClick={() => setCurrentTab('clearance')}
              className="w-full h-[110px] border border-gray-150 hover:border-primary/30 hover:bg-primary-light/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-0.5 duration-200 group text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-800">My Clearance</span>
            </button>
          </div>
        </div>

      </div>`;

fs.writeFileSync(path, [...before, newContent, ...after].join('\\n'));
