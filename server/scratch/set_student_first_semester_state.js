const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Clearance = require('../models/Clearance');
const { runClearanceEngine } = require('../services/clearanceEngine');

async function resetState() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const student = await User.findOne({ email: 'student@caleb.edu.ng' });
    if (!student) {
      console.error('Student user student@caleb.edu.ng not found!');
      process.exit(1);
    }

    // Clean up
    await Transaction.deleteMany({ student: student._id });
    await Clearance.deleteMany({ student: student._id });

    // Set hostel to Elisha Hall (Shared)
    student.hostel = 'Elisha Hall (Shared)';
    await student.save();

    // Create 50% payment: ₦860,000 (out of ₦1,720,000)
    await Transaction.create({
      student: student._id,
      paystackReference: 'TX_SEMESTER_TEST',
      amount: 860000,
      status: 'success',
      academicSession: '2025/2026'
    });

    console.log('Reset test student payment to exactly ₦860,000 (50%).');

    // Run engine
    await runClearanceEngine(student._id, '2025/2026');

    const clearance = await Clearance.findOne({ student: student._id });
    console.log(`Updated state: Status = ${clearance.status}, Scope = ${clearance.scope}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetState();
