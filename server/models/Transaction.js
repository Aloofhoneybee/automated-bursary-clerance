const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paystackReference: { type: String, required: true, unique: true }, // idempotency key
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  channel: { type: String }, // card, bank_transfer, ussd
  status: { type: String, enum: ['pending', 'success', 'failed', 'cancelled'], default: 'pending' },
  paystackResponse: { type: mongoose.Schema.Types.Mixed }, // raw webhook payload stored as-is
  academicSession: { type: String, required: true },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);