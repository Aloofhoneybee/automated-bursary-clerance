const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Clearance = require('../models/Clearance');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const student = await User.findOne({ email: 'richard.okorie@calebuniversity.edu.ng' });
  if (!student) {
    console.log('Student not found');
    process.exit(1);
  }

  // Restore status and scope to not_cleared / none as per Bursary Staff One manual override
  const result = await Clearance.findOneAndUpdate(
    { student: student._id },
    {
      status: 'not_cleared',
      scope: 'none',
      clearedAt: null,
      verificationToken: null
    },
    { new: true }
  );

  console.log('Restored Clearance:', result);
  process.exit(0);
}
run();
