const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Clearance = require('../models/Clearance');

async function fixRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Find the contaminated user
    const user = await User.findOne({ email: 'admin@calebuniversity.edu.ng' });
    if (user) {
      console.log(`Found user: ${user.fullName}, current role: ${user.role}`);
      user.role = 'admin';
      await user.save();
      console.log(`Updated role to 'admin' for ${user.fullName}`);
    } else {
      console.log('User admin@calebuniversity.edu.ng not found.');
    }

    // 2. Remove any accidental clearance records for admin/staff
    const adminsAndStaff = await User.find({ role: { $in: ['admin', 'staff'] } });
    const adminStaffIds = adminsAndStaff.map(u => u._id);
    
    const deletedClearances = await Clearance.deleteMany({ student: { $in: adminStaffIds } });
    console.log(`Deleted ${deletedClearances.deletedCount} clearance records for admin/staff users.`);

    process.exit(0);
  } catch (err) {
    console.error('Error fixing roles:', err);
    process.exit(1);
  }
}

fixRoles();
