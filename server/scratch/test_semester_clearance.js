const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const FeeStructure = require('../models/FeeStructure');
const Clearance = require('../models/Clearance');
const { runClearanceEngine } = require('../services/clearanceEngine');

async function testSemesterClearance() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Get student user
    const student = await User.findOne({ email: 'student@caleb.edu.ng' });
    if (!student) {
      console.error('Student user student@caleb.edu.ng not found!');
      process.exit(1);
    }
    console.log(`Testing with student: ${student.fullName}`);

    // Clean up existing transactions & clearances for a fresh test state
    await Transaction.deleteMany({ student: student._id });
    await Clearance.deleteMany({ student: student._id });

    // Set hostel to Elisha Hall (Shared) - 270,000
    // Base fee is 1,450,000
    // Total is 1,720,000
    student.hostel = 'Elisha Hall (Shared)';
    await student.save();
    console.log('Set hostel to: Elisha Hall (Shared). Total required is ₦1,720,000.');

    // CASE 1: Run engine with 0 payments
    await runClearanceEngine(student._id, '2025/2026');
    let clearance = await Clearance.findOne({ student: student._id });
    console.log(`CASE 1 (0 payments): Status = ${clearance?.status}, Scope = ${clearance?.scope} (Expected: not_cleared, none)`);
    if (clearance?.status !== 'not_cleared' || clearance?.scope !== 'none') {
      throw new Error('CASE 1 Assertion failed!');
    }

    // CASE 2: Pay less than 50% (e.g., ₦859,000 - which is just short of ₦860,000)
    await Transaction.create({
      student: student._id,
      paystackReference: 'TX_UNDER_50',
      amount: 859000,
      status: 'success',
      academicSession: '2025/2026'
    });
    console.log('Created payment of ₦859,000 (< 50%)');
    await runClearanceEngine(student._id, '2025/2026');
    clearance = await Clearance.findOne({ student: student._id });
    console.log(`CASE 2 (Under 50%): Status = ${clearance?.status}, Scope = ${clearance?.scope} (Expected: not_cleared, none)`);
    if (clearance?.status !== 'not_cleared' || clearance?.scope !== 'none') {
      throw new Error('CASE 2 Assertion failed!');
    }

    // CASE 3: Pay exactly 50% (₦860,000 total paid, so we pay ₦1,000 more)
    await Transaction.create({
      student: student._id,
      paystackReference: 'TX_EXACT_50',
      amount: 1000,
      status: 'success',
      academicSession: '2025/2026'
    });
    console.log('Created payment of ₦1,000 (total paid ₦860,000 = exactly 50%)');
    await runClearanceEngine(student._id, '2025/2026');
    clearance = await Clearance.findOne({ student: student._id });
    console.log(`CASE 3 (Exactly 50%): Status = ${clearance?.status}, Scope = ${clearance?.scope} (Expected: cleared, first_semester)`);
    if (clearance?.status !== 'cleared' || clearance?.scope !== 'first_semester') {
      throw new Error('CASE 3 Assertion failed!');
    }

    // CASE 4: Pay full amount (₦1,720,000 total paid, so we pay remaining ₦860,000)
    await Transaction.create({
      student: student._id,
      paystackReference: 'TX_FULL',
      amount: 860000,
      status: 'success',
      academicSession: '2025/2026'
    });
    console.log('Created payment of ₦860,000 (total paid ₦1,720,000 = 100%)');
    await runClearanceEngine(student._id, '2025/2026');
    clearance = await Clearance.findOne({ student: student._id });
    console.log(`CASE 4 (100%): Status = ${clearance?.status}, Scope = ${clearance?.scope} (Expected: cleared, full)`);
    if (clearance?.status !== 'cleared' || clearance?.scope !== 'full') {
      throw new Error('CASE 4 Assertion failed!');
    }

    console.log('\n=======================================');
    console.log('🎉 SEMESTER CLEARANCE POLICY CHECKS PASSED!');
    console.log('=======================================');
    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err.message);
    process.exit(1);
  }
}

testSemesterClearance();
