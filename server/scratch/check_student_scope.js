const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Clearance = require('../models/Clearance');

async function checkStudent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const student = await User.findOne({ matricNumber: '22/11488' });
    if (!student) {
      console.log('Student not found');
      process.exit(0);
    }
    console.log(`Student: ${student.fullName}, Email: ${student.email}`);

    const clearance = await Clearance.findOne({ student: student._id });
    if (clearance) {
      console.log(`Clearance status: ${clearance.status}`);
      console.log(`Clearance scope: ${clearance.scope}`);
      console.log(`Clearance record:`, JSON.stringify(clearance, null, 2));
    } else {
      console.log('No clearance record found');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStudent();
