const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const passwords = ['password', 'Password123!', 'Password123', 'Admin1234!', 'student123', 'student'];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB.');
    const user = await User.findOne({ email: 'staff@caleb.edu.ng' }).select('+password');
    if (!user) {
      console.log('User staff@caleb.edu.ng not found.');
      process.exit(0);
    }

    console.log('Testing passwords for:', user.email);
    let found = false;
    for (const pwd of passwords) {
      const match = await bcrypt.compare(pwd, user.password);
      if (match) {
        console.log(`FOUND! Password is: "${pwd}"`);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log('None of the common test passwords matched.');
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
