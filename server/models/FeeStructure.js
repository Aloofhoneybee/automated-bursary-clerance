const mongoose = require('mongoose');

const feeItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  isCompulsory: { type: Boolean, default: true },
});

const feeStructureSchema = new mongoose.Schema({
  academicSession: { type: String, required: true }, // e.g. "2023/2024"
  studentCategory: { type: String, required: true }, // e.g. "100 Level", "Returning"
  department: { type: String, default: 'Computer Science' },
  feeItems: [feeItemSchema],
  totalAmount: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);