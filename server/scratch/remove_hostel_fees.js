const mongoose = require('mongoose');
require('dotenv').config();
const FeeStructure = require('../models/FeeStructure');

async function removeHostelFees() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const fees = await FeeStructure.find({});
    console.log(`Found ${fees.length} fee structures.`);

    for (let f of fees) {
      const originalCount = f.feeItems.length;
      f.feeItems = f.feeItems.filter(
        item => !item.description.toLowerCase().includes('hostel')
      );
      
      const newCount = f.feeItems.length;
      if (originalCount !== newCount) {
        f.totalAmount = f.feeItems.reduce((sum, item) => sum + item.amount, 0);
        await f.save();
        console.log(`Updated structure for ${f.department} (${f.studentCategory}): removed ${originalCount - newCount} hostel items, new total: ₦${f.totalAmount.toLocaleString()}`);
      }
    }

    console.log('Database migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

removeHostelFees();
