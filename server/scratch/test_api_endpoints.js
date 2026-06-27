const http = require('http');
require('dotenv').config();

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data ? JSON.parse(data) : null
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

async function verifyAPI() {
  try {
    console.log('--- 1. Testing Login ---');
    const loginRes = await makeRequest('POST', '/api/auth/login', {}, {
      email: 'student@caleb.edu.ng',
      password: 'student123'
    });

    if (loginRes.statusCode !== 200) {
      throw new Error(`Login failed with status ${loginRes.statusCode}: ${JSON.stringify(loginRes.data)}`);
    }

    const token = loginRes.data.token;
    const user = loginRes.data.data;
    console.log(`Successfully logged in as: ${user.fullName} (${user.email})`);
    console.log(`Current hostel selection: ${user.hostel}`);

    const authHeaders = { 'Authorization': `Bearer ${token}` };

    console.log('\n--- 2. Fetching Initial Clearance Status ---');
    const clearanceRes = await makeRequest('GET', '/api/clearance/my-status', authHeaders);
    if (clearanceRes.statusCode !== 200) {
      throw new Error(`Failed to fetch clearance status: ${JSON.stringify(clearanceRes.data)}`);
    }
    console.log('Initial Clearance Status:', clearanceRes.data.data.status);
    // Paid 1M, Required 1.72M (1.45M + 270k). Status should be not_cleared.
    if (clearanceRes.data.data.status !== 'not_cleared') {
      throw new Error(`Expected clearance status to be not_cleared, got: ${clearanceRes.data.data.status}`);
    }

    console.log('\n--- 3. Upgrading Hostel via PATCH /api/auth/me ---');
    const updateRes = await makeRequest('PATCH', '/api/auth/me', authHeaders, {
      hostel: 'David Hostel (Premium)'
    });
    if (updateRes.statusCode !== 200) {
      throw new Error(`PATCH /api/auth/me failed: ${JSON.stringify(updateRes.data)}`);
    }
    console.log('Profile update response:', updateRes.data.message);
    console.log('New hostel in profile:', updateRes.data.data.hostel);
    if (updateRes.data.data.hostel !== 'David Hostel (Premium)') {
      throw new Error(`Expected profile hostel to be 'David Hostel (Premium)', got: ${updateRes.data.data.hostel}`);
    }

    console.log('\n--- 4. Verifying Clearance Status after Hostel Change ---');
    const clearanceRes2 = await makeRequest('GET', '/api/clearance/my-status', authHeaders);
    if (clearanceRes2.statusCode !== 200) {
      throw new Error(`Failed to fetch clearance status after change: ${JSON.stringify(clearanceRes2.data)}`);
    }
    console.log('Clearance Status after upgrade:', clearanceRes2.data.data.status);
    // Still not_cleared since total paid is 1M and total required is now 1.95M.
    if (clearanceRes2.data.data.status !== 'not_cleared') {
      throw new Error(`Expected clearance status to remain not_cleared, got: ${clearanceRes2.data.data.status}`);
    }

    console.log('\n=======================================');
    console.log('🎉 ALL API ENDPOINT FLOW TESTS PASSED!');
    console.log('=======================================');
    process.exit(0);
  } catch (err) {
    console.error('API Verification failed:', err.message);
    process.exit(1);
  }
}

verifyAPI();
