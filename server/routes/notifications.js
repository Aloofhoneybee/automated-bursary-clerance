const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyNotifications,
  markAllNotificationsAsRead,
  clearAllNotifications
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getMyNotifications)
  .delete(clearAllNotifications);

router.patch('/mark-read', markAllNotificationsAsRead);

module.exports = router;
