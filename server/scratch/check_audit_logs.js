const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const logs = await AuditLog.find({ targetUser: '6a30ae3cfd45eb9f31a83ada' }).populate('actingUser');
  console.log('Audit Logs for Richard:', logs);
  process.exit(0);
}
run();
