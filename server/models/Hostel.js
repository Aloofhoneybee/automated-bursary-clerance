const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  allocated: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  pending: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
