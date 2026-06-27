const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existing = await User.findOne({ email: 'admin@caleb.edu.ng' });
    if (existing) {
      console.log('Admin already exists, skipping seed');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin1234!', 12);

    await User.create({
      fullName: 'System Administrator',
      email: 'admin@caleb.edu.ng',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();