const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Clearance = require('./models/Clearance');

async function updateSessions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Update all student accounts' academicSession to '2025/2026'
    const studentUpdateResult = await User.updateMany(
      { role: 'student', academicSession: { $ne: '2025/2026' } },
      { $set: { academicSession: '2025/2026' } }
    );
    console.log(`Updated ${studentUpdateResult.modifiedCount} student user accounts to session 2025/2026.`);

    // 2. Update all transactions' academicSession to '2025/2026'
    const transactionUpdateResult = await Transaction.updateMany(
      { academicSession: { $ne: '2025/2026' } },
      { $set: { academicSession: '2025/2026' } }
    );
    console.log(`Updated ${transactionUpdateResult.modifiedCount} transactions to session 2025/2026.`);

    // 3. Update all clearances' academicSession to '2025/2026'
    const clearanceUpdateResult = await Clearance.updateMany(
      { academicSession: { $ne: '2025/2026' } },
      { $set: { academicSession: '2025/2026' } }
    );
    console.log(`Updated ${clearanceUpdateResult.modifiedCount} clearance records to session 2025/2026.`);

    process.exit(0);
  } catch (err) {
    console.error('Failed to update database sessions:', err);
    process.exit(1);
  }
}

updateSessions();
