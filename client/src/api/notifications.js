import request from './client';

export const getMyNotifications = () => request('/notifications');

export const markAllNotificationsAsRead = () =>
  request('/notifications/mark-read', {
    method: 'PATCH'
  });

export const clearAllNotifications = () =>
  request('/notifications', {
    method: 'DELETE'
  });
