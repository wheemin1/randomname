// cross-platform favicon copy script
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'dist', 'public', 'favicon.png');
const dest = path.join(__dirname, 'dist', 'public', 'favicon.ico');

fs.copyFile(src, dest, (err) => {
  if (err) {
    console.error('Favicon copy failed:', err);
    process.exit(1);
  } else {
    console.log('Favicon copied to favicon.ico');
  }
});
