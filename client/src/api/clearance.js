import request from './client';

export const getMyClearanceStatus = () => request('/clearance/my-status');

export const verifyCertificate = (token) => request(`/clearance/verify/${token}`);

export const getAllClearances = () => request('/clearance/all');

export const getPendingReview = () => request('/clearance/pending-review');

export const overrideClearance = (studentId, status, comment, scope) =>
  request(`/clearance/override/${studentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, comment, scope }),
  });

export const downloadCertificate = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/clearance/certificate', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to download certificate');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clearance_certificate.pdf';
  a.click();
  window.URL.revokeObjectURL(url);
};