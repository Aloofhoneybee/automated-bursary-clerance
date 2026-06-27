const fs = require('fs');
const path = require('path');

function searchDir(dir, queries) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, queries);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const query of queries) {
        if (content.toLowerCase().includes(query.toLowerCase())) {
          console.log(`Found "${query}" in: ${fullPath}`);
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              console.log(`  Line ${idx + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }
}

searchDir('c:/Users/admin/OneDrive/Desktop/Automated busary clearance/client/src', ['Grace', 'Standard Mary', 'Susanna']);
