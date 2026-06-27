import React, { useState, useEffect } from 'react';
import { getAuditLog } from '../api/reports';

export default function AdminLogsView() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const loadLogs = () => {
    setLoading(true);
    getAuditLog()
      .then((res) => {
        setLogs(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load audit logs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const formatLogTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const pad = (n) => String(n).padStart(2, '0');
      return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
    } catch (e) {
      return '[00:00:00]';
    }
  };

  const getEventPrefix = (eventType) => {
    switch (eventType) {
      case 'login': return 'LOGIN';
      case 'payment': return 'PAYMENT';
      case 'clearance': return 'CLEARANCE';
      case 'user_management': return 'USER_MGMT';
      case 'system': return 'SYSTEM';
      default: return eventType ? eventType.toUpperCase() : 'LOG';
    }
  };

  const getPrefixColor = (eventType) => {
    switch (eventType) {
      case 'login': return '#2563EB'; // Blue
      case 'payment': return '#10B981'; // Emerald
      case 'clearance': return '#7C3AED'; // Violet
      case 'user_management': return '#EA580C'; // Orange
      case 'system': return '#E11D48'; // Rose
      default: return '#16A34A'; // Green
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      (log.actingUser?.fullName && log.actingUser.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (log.actingUser?.email && log.actingUser.email.toLowerCase().includes(search.toLowerCase()));

    const matchesType =
      typeFilter === 'All' ||
      log.eventType === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">System Audit Logs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time security auditing and administrative transaction trails.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="group h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-gray-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] hover:scale-[1.02] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className={`w-4 h-4 text-gray-400 group-hover:text-slate-600 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-all duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh Feed
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
            placeholder="Search logs by description, email, or name..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Event Group:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 focus:outline-none cursor-pointer"
          >
            <option value="All">All Events</option>
            <option value="Login">Logins</option>
            <option value="Payment">Payments</option>
            <option value="Clearance">Clearances</option>
            <option value="User_Management">Account Creation</option>
          </select>
        </div>
      </div>

      {/* Audit Log Feed Card */}
      <div className="bg-white rounded-[24px] border border-gray-200 p-8 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Registry Audit Feed</h3>
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-semibold">Loading system audit trails...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 font-semibold">
            No audit records found matching the filters.
          </div>
        ) : (
          <div className="space-y-4 font-mono text-xs text-gray-650 p-2 divide-y divide-gray-100">
            {filteredLogs.map((log) => {
              const timeStr = formatLogTime(log.createdAt);
              const prefix = getEventPrefix(log.eventType);
              const prefixColor = getPrefixColor(log.eventType);

              return (
                <div key={log._id} className="pt-3 flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="shrink-0 flex items-center gap-1.5 font-bold">
                    <span className="text-slate-400">{timeStr}</span>
                    <span style={{ color: prefixColor }}>[{prefix}]</span>
                  </div>
                  <div className="flex-1">
                    <span>{log.description}</span>
                    {log.actingUser && (
                      <span className="text-[10px] text-gray-450 block mt-0.5">
                        Triggered by: <span className="font-semibold">{log.actingUser.fullName}</span> ({log.actingUser.role})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
