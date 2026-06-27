import request from './client';

export const getAllHostels = () => request('/hostels');

export const updateHostelRate = (id, amount) =>
  request(`/hostels/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ amount }),
  });
