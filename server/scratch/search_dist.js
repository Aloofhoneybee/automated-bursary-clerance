const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/admin/OneDrive/Desktop/Automated busary clearance/client/dist/assets/index-6WWoSzxU.js';
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const queries = ['Standard Mary', 'Susanna', 'Grace', 'Hostel Clearance Management', 'Manage Hostel Clearances'];
  queries.forEach(q => {
    const found = content.includes(q);
    console.log(`Query "${q}": ${found ? 'FOUND' : 'NOT FOUND'}`);
  });
} else {
  console.log('File does not exist');
}
