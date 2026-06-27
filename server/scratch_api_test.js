const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();

const User = require('./models/User');
const FeeStructure = require('./models/FeeStructure');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

function makeRequest(method, path, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testApi() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Get staff user
    const staff = await User.findOne({ email: 'staff@caleb.edu.ng' });
    if (!staff) {
      console.error('Staff user not found!');
      process.exit(1);
    }
    console.log(`Staff User: ${staff.fullName} (role: ${staff.role})`);

    const token = signToken(staff._id);
    console.log('Generated JWT token for staff.');

    // 2. Test GET /api/users?role=student
    console.log('\n--- Testing GET /api/users?role=student ---');
    const usersRes = await makeRequest('GET', '/api/users?role=student', token);
    console.log('Status:', usersRes.statusCode);
    console.log('Body:', usersRes.body.substring(0, 300));

    // 3. Test GET /api/clearance/all
    console.log('\n--- Testing GET /api/clearance/all ---');
    const clearanceRes = await makeRequest('GET', '/api/clearance/all', token);
    console.log('Status:', clearanceRes.statusCode);
    console.log('Body:', clearanceRes.body.substring(0, 300));

    // 4. Test GET /api/payments/all
    console.log('\n--- Testing GET /api/payments/all ---');
    const paymentsRes = await makeRequest('GET', '/api/payments/all', token);
    console.log('Status:', paymentsRes.statusCode);
    console.log('Body:', paymentsRes.body.substring(0, 300));

    // 5. Test GET /api/fees
    console.log('\n--- Testing GET /api/fees ---');
    const feesRes = await makeRequest('GET', '/api/fees', token);
    console.log('Status:', feesRes.statusCode);
    console.log('Body:', feesRes.body.substring(0, 300));

    // 6. Test PATCH /api/fees/:id
    const feeObj = await FeeStructure.findOne({});
    if (feeObj) {
      console.log(`\n--- Testing PATCH /api/fees/${feeObj._id} ---`);
      const patchRes = await makeRequest('PATCH', `/api/fees/${feeObj._id}`, token, {
        feeItems: feeObj.feeItems
      });
      console.log('Status:', patchRes.statusCode);
      console.log('Body:', patchRes.body);
    } else {
      console.log('No fee structure found to test PATCH.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during testing:', err);
    process.exit(1);
  }
}

testApi();
