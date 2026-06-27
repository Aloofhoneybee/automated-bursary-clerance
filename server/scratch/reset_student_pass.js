const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function resetPass() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    await User.updateOne({ email: 'student@caleb.edu.ng' }, { $set: { password: hashedPassword } });
    console.log('Password updated successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPass();
