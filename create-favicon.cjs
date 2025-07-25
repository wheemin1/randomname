// This is a base64 encoded simple favicon
// You can replace this with an actual favicon file later
const fs = require('fs');
const path = require('path');

const faviconBase64 = `
iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACx
jwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAQ9SURBVFhH7ZZdaBxVFMf/d2Z2djbZ3ezm+2s3
TWrT+lFTbYUKohYfFPogCEVB8fah+OCTSKEvvhTEB8EHoYJPggpSrKBYoaLU0hZrWts0NTVfTZrN
ZnezuzO7sztz73h3drKTySa7YR988MDdmTtz7v+c/znn3BnCOcdt/O9BSilUKkzCnDFGDznzxhAJ
rSHkLHBuSRgjFwuFwsfc46HVmHd9KBaLo9ls9ne9Xh9mjGFqauqWiUgShVKpLhDYnozHsWPHDjgc
DmGJJYhiwcHBwUO6rh+qVqtRy1jHtgRIkoSJiQk8e/Ag/MEQXJoGWZLEFUthmmZEtm37aDQaL8/O
zu7eMgFrFARBeHfq8QgcCgmEQEFtU14QxohpGhgfH3+hVCp9uR0Cm2ZBKBTComkU1iqUNNGfN6+r
KKy7v1xZgcfjmdgygdnZWRHCd0ZHRqBpbrQ1G+WbK5g6fwGWbuJ6oYCi6UK5nMfNnAW328X3796N
+fl5XlCaVxfYGgHO2sPJZBKapkGWZFRrBpaWluGPJhHsHwWRnXBobtzILCK7sID4QAI+rxeyInOv
LLQ0O7YUAmNmJK5wDzgvcHsHZiYVDBh1+CiDQTmUahmKWYXXlKA6nXxJ4AH3wOUKIBoNI51OQx0Z
Gdq7d6+2KQFd15eHh4dF+BRFQW75GqgkYFBV4ZUlBAiBRiiyczmIrTRNE62jtRuapsPjdnMb2hQc
IrM2JFAsFq+PjY1B4QRkWUKxsIDEwACCmhsBjxsuSUKm0cCNTAbxeByKokDV6sKj1r0HWZJ5XRi8
pjZBwGg0SplMBoODg5A5AUVRQFtVXhgaCKW8/jWcuz6LlZUVVCoV1Ot17pkCp9OJzGIGDrWGuro5
Ao4ND0NWOQGnEy6XB83aKhLJPgwORBAJBaFwApeuXoXX60WtVhOkZEUVBDuZdCMSS9i+BLFYTGx/
gIfA43YLIs2mg1eTH35O7tjjj8Dn8/GQ6OgfGAAhEvw+HzzJB/DQzqQt/3x+H0fHxyFxyR0OJ18i
cCgEoijBzJbw3AszkDlhgXPnYFCK04dPIjuTht/vhyiJNuiRJ2GYWfY7oZSK53K5cCqVEk1G4wHW
6g0YPHUUcxUXPjj2Dj767CTCgQB8Pi/vhCrKOgO6nsd37kO5XALhhWibkBDOLi4uxrdu3SqCVa/V
+VIHS/k8FI8XgUgcXl7tdkLQ3VQ6vLa39mZb65G4ePmy3/akRCKBtdVVcNsIJi5egsPt7UOo7YkG
qUCzXEOWd9mBoeEtoRXQjjP+d2DLBDqf9C8R6OhzQqBI9CcN49F/OYzxZ05vC10eUEp3nD179uzj
LUHzlBuVz3nKeYUZMKvV9TfOWzBNc+T06dMvbdxqXQQopWxubi7Eq/w5Pij2cd8jNtchzWZz19TU
1BGbaxVdIXjttVd4KsYo43uw02aMvXT8+LHvbK7/LAB+A2BzjHy8UfluAAAAAElFTkSuQmCC
`;

// Determine directories
const clientPublicDir = path.join(__dirname, 'client', 'public');
const distPublicDir = path.join(__dirname, 'dist', 'public');

// Ensure directories exist
try {
  if (!fs.existsSync(clientPublicDir)) {
    fs.mkdirSync(clientPublicDir, { recursive: true });
  }
  
  if (!fs.existsSync(distPublicDir)) {
    try {
      fs.mkdirSync(distPublicDir, { recursive: true });
    } catch (err) {
      console.error('Could not create dist/public directory, might not be needed in this environment');
    }
  }
} catch (err) {
  console.error('Error creating directories:', err);
}

// Convert base64 to binary
const binaryString = Buffer.from(faviconBase64.replace(/\s/g, ''), 'base64');

// Write to client/public directory
try {
  fs.writeFileSync(path.join(clientPublicDir, 'favicon.png'), binaryString);
  fs.writeFileSync(path.join(clientPublicDir, 'favicon.ico'), binaryString);
  console.log('Favicon created successfully in client/public directory!');
  
  // Also write to dist/public if it exists (for production builds)
  try {
    if (fs.existsSync(distPublicDir)) {
      fs.writeFileSync(path.join(distPublicDir, 'favicon.png'), binaryString);
      fs.writeFileSync(path.join(distPublicDir, 'favicon.ico'), binaryString);
      console.log('Favicon also copied to dist/public directory!');
    }
  } catch (err) {
    console.error('Error writing to dist/public:', err);
  }
} catch (err) {
  console.error('Error writing favicon:', err);
}
