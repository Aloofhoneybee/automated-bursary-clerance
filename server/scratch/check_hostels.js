const mongoose = require('mongoose');
require('dotenv').config();
const Hostel = require('../models/Hostel');

async function checkHostels() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const hostels = await Hostel.find({});
    console.log('\n--- HOSTELS IN DATABASE ---');
    console.log(JSON.stringify(hostels, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkHostels();
