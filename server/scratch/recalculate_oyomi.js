const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Clearance = require('../models/Clearance');
const { runClearanceEngine } = require('../services/clearanceEngine');

async function recalculate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const student = await User.findOne({ email: 'ayololuwa.oyomi@calebuniversity.edu.ng' });
    if (!student) {
      console.error('Student not found!');
      process.exit(1);
    }
    console.log(`Student: ${student.fullName}, Matric: ${student.matricNumber}, Level: ${student.level}`);

    // Trigger engine
    await runClearanceEngine(student._id, '2025/2026');

    const clearance = await Clearance.findOne({ student: student._id });
    console.log(`Updated state: Status = ${clearance.status}, Scope = ${clearance.scope}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

recalculate();
