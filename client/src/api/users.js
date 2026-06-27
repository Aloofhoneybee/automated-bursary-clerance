import request from './client';

export const getAllUsers = (role) =>
  request(`/users${role ? `?role=${role}` : ''}`);

export const deactivateUser = (id) =>
  request(`/users/${id}/deactivate`, { method: 'PATCH' });

export const reactivateUser = (id) =>
  request(`/users/${id}/reactivate`, { method: 'PATCH' });

export const updateMyPassword = (currentPassword, newPassword) =>
  request('/users/my-password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const createUser = (userData) =>
  request('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const updateUser = (id, userData) =>
  request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });