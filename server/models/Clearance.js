const mongoose = require('mongoose');

const clearanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  academicSession: { type: String, required: true },
  status: { type: String, enum: ['cleared', 'not_cleared', 'pending_review'], default: 'not_cleared' },
  scope: { type: String, enum: ['first_semester', 'full', 'none'], default: 'none' },
  verificationToken: { type: String, unique: true, sparse: true }, // used in QR code
  triggeringTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  clearedAt: { type: Date },
  staffOverride: {
    overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String },
    overriddenAt: { type: Date },
  },
}, { timestamps: true });

module.exports = mongoose.model('Clearance', clearanceSchema);