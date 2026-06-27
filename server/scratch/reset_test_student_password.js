const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Clearance = require('../models/Clearance');
const { runClearanceEngine } = require('../services/clearanceEngine');

async function resetStudent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const email = 'student@caleb.edu.ng';
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User student@caleb.edu.ng not found.');
      process.exit(1);
    }

    // Reset password to "student123"
    const hashedPassword = await bcrypt.hash('student123', 12);
    user.password = hashedPassword;
    user.hostel = 'Elisha Hall (Shared)'; // reset to default shared male hostel
    await user.save();
    console.log(`Reset student ${email} password to 'student123' and hostel to 'Elisha Hall (Shared)'.`);

    // Reset transactions to a partial payment state
    await Transaction.deleteMany({ student: user._id });
    await Clearance.deleteMany({ student: user._id });

    // Base fee is 1,450,000. Hostel is 270,000. Total = 1,720,000.
    // Create a transaction of 1,000,000 (outstanding = 720,000)
    await Transaction.create({
      student: user._id,
      paystackReference: 'TX_INITIAL_1M',
      amount: 1000000,
      status: 'success',
      academicSession: '2025/2026'
    });
    console.log('Seeded a partial payment of ₦1,000,000 (leaving ₦720,000 outstanding).');

    // Run engine to sync clearance
    await runClearanceEngine(user._id, '2025/2026');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetStudent();
