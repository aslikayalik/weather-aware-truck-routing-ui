const fs = require('fs');
const path = require('path');

const buildInfo = {
  buildDate: new Date().toISOString(),
  timestamp: Date.now()
};

const targetPath = path.join(__dirname, '../src/buildInfo.json');

fs.writeFileSync(
  targetPath,
  JSON.stringify(buildInfo, null, 2)
);

console.log('✓ Build info generated:', buildInfo.buildDate);