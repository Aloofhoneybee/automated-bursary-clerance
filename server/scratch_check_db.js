const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const FeeStructure = require('./models/FeeStructure');

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const users = await User.find({});
    console.log('\n--- USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.fullName}, Matric: ${u.matricNumber}, Email: ${u.email}, Dept: ${u.department}, Session: ${u.academicSession}, Level: ${u.level}, Role: ${u.role}`);
    });

    const fees = await FeeStructure.find({});
    console.log('\n--- FEE STRUCTURES ---');
    fees.forEach(f => {
      console.log(`ID: ${f._id}, Dept: ${f.department}, Session: ${f.academicSession}, Category: ${f.studentCategory}, Total: ${f.totalAmount}, Active: ${f.isActive}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
