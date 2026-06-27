import request from './client';

export const initializePayment = (studentCategory, amount) =>
  request('/payments/initialize', {
    method: 'POST',
    body: JSON.stringify({ studentCategory, amount }),
  });

export const getMyTransactions = () => request('/payments/my-transactions');

export const getAllTransactions = () => request('/payments/all');

export const verifyPayment = (reference) => request(`/payments/verify/${reference}`);