const mongoose = require('mongoose');
require('dotenv').config();

const FeeStructure = require('../models/User'); // wait, the model is FeeStructure
const FeeModel = require('../models/FeeStructure');

async function checkFees() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const fees = await FeeModel.find({});
    console.log('\n--- FEE STRUCTURES ---');
    fees.forEach(f => {
      console.log(`ID: ${f._id}`);
      console.log(`Dept: ${f.department}, Session: ${f.academicSession}, Category: ${f.studentCategory}, Total: ${f.totalAmount}, Active: ${f.isActive}`);
      console.log(`Fee Items:`, JSON.stringify(f.feeItems, null, 2));
      console.log('------------------------------------');
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkFees();
