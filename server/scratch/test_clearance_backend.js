const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const FeeStructure = require('../models/FeeStructure');
const Clearance = require('../models/Clearance');
const { runClearanceEngine } = require('../services/clearanceEngine');

async function testClearanceEngine() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Get student user
    const student = await User.findOne({ email: 'student@caleb.edu.ng' });
    if (!student) {
      console.error('Student user student@caleb.edu.ng not found!');
      process.exit(1);
    }
    console.log(`Testing with student: ${student.fullName} (gender: ${student.gender})`);

    // Clean up existing transactions & clearances for a fresh test state
    await Transaction.deleteMany({ student: student._id });
    await Clearance.deleteMany({ student: student._id });

    // Base fee is 1,450,000.
    // 2. Set hostel to Elisha Hall (Shared) - 270,000
    student.hostel = 'Elisha Hall (Shared)';
    await student.save();
    console.log('Set hostel to: Elisha Hall (Shared)');

    // Run engine with 0 payments
    await runClearanceEngine(student._id, '2025/2026');
    let clearance = await Clearance.findOne({ student: student._id });
    console.log(`With 0 payments, clearance status is: ${clearance?.status} (Expected: not_cleared)`);
    if (clearance?.status !== 'not_cleared') {
      throw new Error('Assertion failed: status should be not_cleared');
    }

    // 3. Make a payment of 1,450,000 (only enough for base fee, not hostel fee)
    await Transaction.create({
      student: student._id,
      paystackReference: 'TX_BASE_ONLY',
      amount: 1450000,
      status: 'success',
      academicSession: '2025/2026'
    });
    console.log('Created base fee payment of ₦1,450,000');

    await runClearanceEngine(student._id, '2025/2026');
    clearance = await Clearance.findOne({ student: student._id });
    console.log(`After base payment, clearance status is: ${clearance?.status} (Expected: not_cleared)`);
    if (clearance?.status !== 'not_cleared') {
      throw new Error('Assertion failed: status should remain not_cleared');
    }

    // 4. Make a payment of 270,000 (enough to cover the hostel fee of 270,000)
    await Transaction.create({
      student: student._id,
      paystackReference: 'TX_HOSTEL_ONLY',
      amount: 270000,
      status: 'success',
      academicSession: '2025/2026'
    });
    console.log('Created hostel fee payment of ₦270,000');

    await runClearanceEngine(student._id, '2025/2026');
    clearance = await Clearance.findOne({ student: student._id });
    console.log(`After hostel payment, clearance status is: ${clearance?.status} (Expected: cleared)`);
    if (clearance?.status !== 'cleared') {
      throw new Error('Assertion failed: status should be cleared');
    }

    // 5. Change hostel selection to a more expensive option: David Hostel (Premium) - 500,000
    // Changing hostel selection via updateMe should trigger clearance engine recalculation,
    // making the total required 1,450,000 + 500,000 = 1,950,000.
    // Total paid is 1,450,000 + 270,000 = 1,720,000, which is insufficient.
    student.hostel = 'David Hostel (Premium)';
    await student.save();
    console.log('Upgraded hostel to: David Hostel (Premium) (₦500,000)');

    // Trigger clearance recalculation
    await runClearanceEngine(student._id, '2025/2026');
    clearance = await Clearance.findOne({ student: student._id });
    console.log(`After hostel upgrade, clearance status is: ${clearance?.status} (Expected: not_cleared)`);
    if (clearance?.status !== 'not_cleared') {
      throw new Error('Assertion failed: status should change back to not_cleared');
    }

    // 6. Add remaining 230,000 to fully cover David Hostel
    await Transaction.create({
      student: student._id,
      paystackReference: 'TX_HOSTEL_UPGRADE',
      amount: 230000,
      status: 'success',
      academicSession: '2025/2026'
    });
    console.log('Created remaining upgrade payment of ₦230,000');

    await runClearanceEngine(student._id, '2025/2026');
    clearance = await Clearance.findOne({ student: student._id });
    console.log(`After outstanding payment, clearance status is: ${clearance?.status} (Expected: cleared)`);
    if (clearance?.status !== 'cleared') {
      throw new Error('Assertion failed: status should be cleared');
    }

    console.log('\n=======================================');
    console.log('🎉 ALL BACKEND CLEARANCE TESTS PASSED!');
    console.log('=======================================');

    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err.message);
    process.exit(1);
  }
}

testClearanceEngine();
