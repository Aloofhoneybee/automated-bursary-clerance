import request from './client';

export const getFinancialSummary = (session) =>
  request(`/reports/summary${session ? `?academicSession=${encodeURIComponent(session)}` : ''}`);

export const getOutstandingStudents = (session) =>
  request(`/reports/outstanding${session ? `?academicSession=${encodeURIComponent(session)}` : ''}`);

export const getAuditLog = (eventType, limit) => {
  let url = '/reports/audit-log';
  const params = [];
  if (eventType) params.push(`eventType=${encodeURIComponent(eventType)}`);
  if (limit) params.push(`limit=${limit}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return request(url);
};

export const getCollectionsByDate = (session) =>
  request(`/reports/collections-by-date${session ? `?academicSession=${encodeURIComponent(session)}` : ''}`);
