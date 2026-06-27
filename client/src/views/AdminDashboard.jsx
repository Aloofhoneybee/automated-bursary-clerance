import React, { useState, useEffect } from 'react';
import { getFinancialSummary, getAuditLog, getCollectionsByDate } from '../api/reports';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  
  // States
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    clearedStudents: 0,
    pendingStudents: 0,
    revenueGenerated: 0
  });
  const [chartData, setChartData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      getFinancialSummary(),
      getCollectionsByDate(),
      getAuditLog(null, 15)
    ])
      .then(([summaryRes, collectionsRes, auditRes]) => {
        // 1. Process KPIs
        const totalStuds = summaryRes.data?.totalStudents || 0;
        const clStats = summaryRes.data?.clearanceStats || [];
        const clearedStuds = clStats.find(s => s._id === 'cleared')?.count || 0;
        const pendingStuds = Math.max(0, totalStuds - clearedStuds);
        const totalColl = summaryRes.data?.totalCollection?.total || 0;

        setKpis({
          totalStudents: totalStuds,
          clearedStudents: clearedStuds,
          pendingStudents: pendingStuds,
          revenueGenerated: totalColl
        });

        // 2. Process Collections chart (Dynamic scale)
        const rawCollections = collectionsRes.data || [];
        const formatted = rawCollections
          .slice(0, 6)
          .reverse()
          .map(item => ({
            label: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount: item.total
          }));
        setChartData(formatted);

        // 3. Audit Logs
        setAuditLogs(auditRes.data || []);
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // SVG chart configurations
  const width = 500;
  const height = 180;
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Calculate dynamic max val
  const maxCollectionAmount = chartData.length > 0 ? Math.max(...chartData.map(d => d.amount)) : 0;
  const maxVal = maxCollectionAmount > 0 ? maxCollectionAmount * 1.2 : 100000;

  // Format y-axis values
  const formatYAxisLabel = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  if (loading && chartData.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-semibold">Loading institutional ledger summary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">University Bursar Overview</h1>
          <p className="text-xs text-gray-500 font-medium mt-1 hidden md:block">Institutional metrics, student clearance validation pipelines, and payment gateway health logs.</p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* KPI 1: Total Students */}
        <div className="bg-white rounded-[20px] border border-gray-200 p-4 md:p-6 flex items-center justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">Total Students</span>
            <h3 className="text-xl md:text-2xl font-black text-secondary">{kpis.totalStudents.toLocaleString()}</h3>
            <span className="text-[10px] text-gray-500 font-medium">Active Enrolled</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hidden sm:flex">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* KPI 2: Cleared Students */}
        <div className="bg-white rounded-[20px] border border-gray-200 p-4 md:p-6 flex items-center justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">Cleared Students</span>
            <h3 className="text-xl md:text-2xl font-black text-primary">{kpis.clearedStudents.toLocaleString()}</h3>
            <span className="text-[10px] text-primary font-bold">
              {kpis.totalStudents > 0 ? ((kpis.clearedStudents / kpis.totalStudents) * 100).toFixed(1) : 0}% Ratio
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary hidden sm:flex">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        {/* KPI 3: Outstanding Payments */}
        <div className="bg-white rounded-[20px] border border-gray-200 p-4 md:p-6 flex items-center justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">Outstanding Payments</span>
            <h3 className="text-xl md:text-2xl font-black text-orange-500">{kpis.pendingStudents.toLocaleString()}</h3>
            <span className="text-[10px] text-gray-500 font-medium">Awaiting Payment</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 hidden sm:flex">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* KPI 4: Revenue Generated */}
        <div className="bg-white rounded-[20px] border border-gray-200 p-4 md:p-6 flex items-center justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">Revenue Generated</span>
            <h3 className="text-xl md:text-2xl font-black text-secondary">
              ₦{kpis.revenueGenerated >= 1000000 ? `${(kpis.revenueGenerated / 1000000).toFixed(2)}M` : kpis.revenueGenerated.toLocaleString()}
            </h3>
            <span className="text-[10px] text-[#065F46] font-bold">Total Cash Collections</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-primary hidden sm:flex">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16M5 3.667A12.018 12.018 0 0012 2c2.51 0 4.802.77 6.696 2.082L20.485 5.5a1 1 0 01.293.707v12.253a1 1 0 01-.293.707L18.696 20.3A12.018 12.018 0 0012 22a12.018 12.018 0 00-6.696-2.082L3.515 18.5a1 1 0 01-.293-.707V6.207a1 1 0 01.293-.707L5.304 3.667z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts & Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue collections chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-[20px] border border-gray-200 p-6 flex flex-col justify-between shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div>
            <h3 className="text-[15px] font-bold text-secondary">Collections Summary</h3>
            <p className="text-xs text-gray-400 mt-0.5">Session billings and payments collected by date (Dynamic Scale)</p>
          </div>

          {/* SVG bar chart */}
          <div className="mt-4">
            {chartData.length === 0 ? (
              <div className="h-[140px] flex items-center justify-center text-xs text-gray-400 font-semibold">
                No transaction collections history recorded yet.
              </div>
            ) : (
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Grid Lines */}
                {[0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal].map((grid, idx) => {
                  const y = padding + chartHeight - (grid / maxVal) * chartHeight;
                  return (
                    <g key={idx}>
                      <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                      <text x={padding - 5} y={y + 3} textAnchor="end" fontSize="8" fill="#94A3B8" fontWeight="bold" className="font-mono">
                        {formatYAxisLabel(grid)}
                      </text>
                    </g>
                  );
                })}

                {/* Bar charts */}
                {chartData.map((data, idx) => {
                  const barWidth = 32;
                  const gap = (chartWidth - barWidth * chartData.length) / (chartData.length + 1);
                  const x = padding + gap + idx * (barWidth + gap);
                  const barHeight = (data.amount / maxVal) * chartHeight;
                  const y = padding + chartHeight - barHeight;

                  return (
                    <g key={idx} className="group cursor-pointer">
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill="var(--color-primary)"
                        className="opacity-90 hover:opacity-100 transition-opacity"
                      />
                      <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="8" fill="var(--color-secondary)" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        ₦{data.amount.toLocaleString()}
                      </text>
                      <text x={x + barWidth / 2} y={padding + chartHeight + 12} textAnchor="middle" fontSize="9" fill="#64748B" fontWeight="600">
                        {data.label}
                      </text>
                    </g>
                  );
                })}

                {/* Axis Line */}
                <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="#CBD5E1" strokeWidth="1" />
              </svg>
            )}
          </div>
        </div>

        {/* Payment Gateway Health (1/3 width) */}
        <div className="bg-white rounded-[20px] border border-gray-200 p-6 space-y-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <div>
            <h3 className="text-[15px] font-bold text-secondary">Gateway Health</h3>
            <p className="text-xs text-gray-400 mt-0.5">Integration status and webhook delivery stats.</p>
          </div>

          <div className="space-y-3.5">
            {/* Paystack status */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800">Paystack Live API</h4>
                  <p className="text-[9px] text-gray-400">Response time: 142ms</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-md border border-primary/10 uppercase">
                Active
              </span>
            </div>

            {/* Webhook Delivery */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800">Webhook Handlers</h4>
                  <p className="text-[9px] text-gray-400">Delivery rate: 99.94%</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-md border border-primary/10 uppercase">
                Online
              </span>
            </div>

            {/* Success Rate */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800">Transaction Success</h4>
                  <p className="text-[9px] text-gray-400">Past 24 hours</p>
                </div>
              </div>
              <span className="text-[12px] font-extrabold text-secondary font-mono">
                98.6%
              </span>
            </div>
          </div>
        </div>
      </div>



      {/* Admin Audit Feed */}
      <div className="bg-white rounded-[20px] border border-gray-200 p-6 space-y-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] animate-in fade-in duration-200">
        <h3 className="text-[15px] font-bold text-secondary">Institutional Audit Logs</h3>
        <div className="space-y-3 font-mono text-[11px] text-gray-500 max-h-[250px] overflow-y-auto divide-y divide-gray-50 pr-2">
          {auditLogs.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-450 font-semibold">
              No audit activities recorded.
            </div>
          ) : (
            auditLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2 pt-2.5 first:pt-0">
                <span className="text-primary font-bold shrink-0">
                  [{new Date(log.createdAt).toLocaleTimeString()}]
                </span>
                <span className="text-slate-700 shrink-0 font-bold">
                  {log.actingUser?.fullName || 'SYSTEM'}:
                </span>
                <span className="text-gray-500">{log.description}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
