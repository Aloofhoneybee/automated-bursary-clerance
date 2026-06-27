const Notification = require('../models/Notification');

// @route  GET /api/notifications
// @access All logged-in users
const getMyNotifications = async (req, res) => {
  try {
    const dbNotifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Welcome notification is global and always included for all users
    const welcomeNotification = {
      _id: 'welcome-notification-global',
      title: 'Welcome to Caleb Bursary Portal',
      description: 'Hello! Welcome to the new Caleb University Bursary Portal. Use this portal to securely reconcile payments, top-up your wallet, and track clearance checks in real time.',
      type: 'system',
      unread: false,
      createdAt: new Date('2026-06-15T00:00:00.000Z')
    };

    res.status(200).json({
      status: 'success',
      data: [
        ...dbNotifications,
        welcomeNotification
      ]
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  PATCH /api/notifications/mark-read
// @access All logged-in users
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, unread: true }, { unread: false });
    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @route  DELETE /api/notifications
// @access All logged-in users
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.status(200).json({
      status: 'success',
      message: 'All notifications cleared'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getMyNotifications,
  markAllNotificationsAsRead,
  clearAllNotifications
};
