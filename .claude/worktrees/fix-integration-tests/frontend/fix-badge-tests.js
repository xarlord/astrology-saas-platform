import fs from 'fs';

const testFile = 'src/components/ui/__tests__/UIComponents.test.tsx';
let content = fs.readFileSync(testFile, 'utf8');

// Fix Badge variant tests - check parent container instead of text node
content = content.replace(
  /expect\(screen\.getByText\('Success'\)\)\.toHaveClass\('bg-green-100'\);/g,
  "expect(screen.getByText('Success').closest('span')).toHaveClass('bg-green-100');"
);

content = content.replace(
  /expect\(screen\.getByText\('Danger'\)\)\.toHaveClass\('bg-red-100'\);/g,
  "expect(screen.getByText('Danger').closest('span')).toHaveClass('bg-red-100');"
);

fs.writeFileSync(testFile, content);
console.log('Fixed Badge CSS class tests');
