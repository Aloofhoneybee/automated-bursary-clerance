const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, default: 'system' }, // 'clearance', 'billing', 'system', 'queue', 'gateway'
  unread: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
