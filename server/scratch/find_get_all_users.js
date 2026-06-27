const fs = require('fs');
const path = require('path');

function searchAllFiles(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
        searchAllFiles(fullPath);
      }
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('getAllUsers')) {
        console.log(`Found in: ${fullPath}`);
      }
    }
  }
}

searchAllFiles('c:/Users/admin/OneDrive/Desktop/Automated busary clearance/client/src');
