const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function diag() {
  try {
    const logoPath = path.join(__dirname, '..', 'client', 'public', 'caleb-logo.jpg');
    console.log('--- Logo Diagnostics ---');
    console.log('Path:', logoPath);
    console.log('Exists:', fs.existsSync(logoPath));
    if (fs.existsSync(logoPath)) {
      const stats = fs.statSync(logoPath);
      console.log('File Size:', stats.size, 'bytes');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n--- Database Diagnostics ---');
    const user = await User.findOne({ email: 'richard.okorie@calebuniversity.edu.ng' });
    if (user) {
      console.log('User found:', user.fullName);
      console.log('Matric:', user.matricNumber);
      console.log('Level in DB:', user.level);
      console.log('Phone in DB:', user.phoneNumber);
      console.log('Email in DB:', user.email);
    } else {
      console.log('User richard.okorie@calebuniversity.edu.ng not found in DB.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

diag();
