import request from './client';

export const getFeeBySessionAndCategory = (session, category) =>
  request(`/fees/session/${encodeURIComponent(session)}/category/${encodeURIComponent(category)}`);

export const getAllFees = () => request('/fees');

export const createFeeStructure = (data) =>
  request('/fees', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateFeeStructure = (id, data) =>
  request(`/fees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteFeeStructure = (id) =>
  request(`/fees/${id}`, {
    method: 'DELETE',
  });