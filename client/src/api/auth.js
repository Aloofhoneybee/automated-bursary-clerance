import request from './client';

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => request('/auth/me');

export const register = (data) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProfile = (data) =>
  request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });