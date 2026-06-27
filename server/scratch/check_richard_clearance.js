const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Clearance = require('../models/Clearance');
const Transaction = require('../models/Transaction');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const student = await User.findOne({ email: 'richard.okorie@calebuniversity.edu.ng' });
  if (!student) {
    console.log('Student not found');
    process.exit(1);
  }
  console.log('Student:', student);
  
  const clearance = await Clearance.findOne({ student: student._id });
  console.log('Clearance Record:', clearance);

  const transactions = await Transaction.find({ student: student._id });
  console.log('Transactions:', transactions);
  
  process.exit(0);
}
run();
