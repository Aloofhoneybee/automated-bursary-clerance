const mongoose = require('mongoose');
const FeeStructure = require('../models/FeeStructure');
require('dotenv').config();

const feesData = [
  {
    department: 'Computer Science',
    academicSession: '2025/2026',
    studentCategory: '100 Level',
    feeItems: [
      { description: 'Program Related Fees', amount: 1200000, isCompulsory: true },
      { description: 'Other Fees', amount: 250000, isCompulsory: true }
    ],
    totalAmount: 1450000,
    isActive: true
  },
  {
    department: 'Mass Communication',
    academicSession: '2025/2026',
    studentCategory: '100 Level',
    feeItems: [
      { description: 'Program Related Fees', amount: 950000, isCompulsory: true },
      { description: 'Other Fees', amount: 200000, isCompulsory: true }
    ],
    totalAmount: 1150000,
    isActive: true
  },
  {
    department: 'Law',
    academicSession: '2025/2026',
    studentCategory: '100 Level',
    feeItems: [
      { description: 'Program Related Fees', amount: 1450000, isCompulsory: true },
      { description: 'Other Fees', amount: 300000, isCompulsory: true }
    ],
    totalAmount: 1750000,
    isActive: true
  },
  {
    department: 'Microbiology',
    academicSession: '2025/2026',
    studentCategory: '100 Level',
    feeItems: [
      { description: 'Program Related Fees', amount: 1050000, isCompulsory: true },
      { description: 'Other Fees', amount: 200000, isCompulsory: true }
    ],
    totalAmount: 1250000,
    isActive: true
  },
  {
    department: 'Accounting',
    academicSession: '2025/2026',
    studentCategory: '100 Level',
    feeItems: [
      { description: 'Program Related Fees', amount: 1150000, isCompulsory: true },
      { description: 'Other Fees', amount: 250000, isCompulsory: true }
    ],
    totalAmount: 1400000,
    isActive: true
  },
  {
    department: 'Architecture',
    academicSession: '2025/2026',
    studentCategory: '100 Level',
    feeItems: [
      { description: 'Program Related Fees', amount: 1380000, isCompulsory: true },
      { description: 'Other Fees', amount: 270000, isCompulsory: true }
    ],
    totalAmount: 1650000,
    isActive: true
  }
];

const seedFees = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for re-seeding fees');

    // Remove any existing active structures for 2025/2026 to avoid duplicates
    await FeeStructure.deleteMany({ academicSession: '2025/2026' });
    console.log('Cleared existing 2025/2026 fee structures.');

    // Insert new department-specific structures
    await FeeStructure.insertMany(feesData);
    console.log('Seeded fee structures successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Seeding fees failed:', err.message);
    process.exit(1);
  }
};

seedFees();
