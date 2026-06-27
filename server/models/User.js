const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  matricNumber: { type: String, sparse: true, unique: true }, // students only
  role: { type: String, enum: ['student', 'staff', 'admin'], required: true },
  department: { type: String, default: 'Computer Science' },
  academicSession: { type: String }, // students only e.g. "2023/2024"
  isActive: { type: Boolean, default: true },
  level: { type: String, default: '100 Level' },
  stateOfOrigin: { type: String, default: 'Lagos' },
  parentPhoneNumber: { type: String, default: '+234 803 000 0000' },
  phoneNumber: { type: String, default: '+234 812 000 0000' },
  gender: { type: String, default: 'Male' },
  dateOfBirth: { type: String, default: '2005-01-01' },
  hostel: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);