const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['login', 'payment', 'clearance_update', 'staff_override', 'fee_structure_change', 'user_management'],
    required: true,
  },
  actingUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who was affected
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }, // any extra context
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);