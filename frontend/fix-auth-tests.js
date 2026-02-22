import fs from 'fs';

const testFile = 'src/components/__tests__/AuthenticationForms.test.tsx';
let content = fs.readFileSync(testFile, 'utf8');

// Fix LoginForm password selectors - use getByPlaceholderText
content = content.replace(
  /screen\.getByLabelText\(\/password\/i\)/g,
  'screen.getByPlaceholderText(/enter your password/i)'
);

// Fix RegisterForm password selectors
content = content.replace(
  /screen\.getByLabelText\(\/\^password\$\/i\)/g,
  'screen.getByPlaceholderText(/create a password/i)'
);

// Fix RegisterForm confirm password selector
content = content.replace(
  /screen\.getByLabelText\(\/confirm password\/i\)/g,
  'screen.getByPlaceholderText(/confirm your password/i)'
);

fs.writeFileSync(testFile, content);
console.log('✅ Fixed AuthenticationForms password selectors');
