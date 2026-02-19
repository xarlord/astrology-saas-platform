const fs = require('fs');
const { execSync } = require('child_process');

// Get all unused variable errors
const errors = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' })
  .split('\n')
  .filter(line => line.includes('TS6133'))
  .map(line => {
    const match = line.match(/(.+)\((\d+),(\d+)\): error TS6133: '(.+)' is declared but its value is never read/);
    if (match) {
      return { file: match[1], line: parseInt(match[2]), col: parseInt(match[3]), var: match[4] };
    }
    return null;
  })
  .filter(Boolean);

console.log(`Found ${errors.length} unused variables`);

// Group by file
const byFile = {};
errors.forEach(err => {
  if (!byFile[err.file]) byFile[err.file] = [];
  byFile[err.file].push(err);
});

// Process each file
Object.entries(byFile).forEach(([file, errs]) => {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  // Process errors in reverse line order to maintain line numbers
  errs.sort((a, b) => b.line - a.line);
  
  errs.forEach(err => {
    const lineIdx = err.line - 1;
    const line = lines[lineIdx];
    
    // Skip if already prefixed with underscore
    if (line.includes(`'${err.var}'`) || line.includes(`"${err.var}"`)) {
      // It's a string literal, skip
      return;
    }
    
    // Check if variable is already prefixed
    const alreadyPrefixed = new RegExp(`\b_${err.var}\b`).test(line);
    if (alreadyPrefixed) return;
    
    // Replace the variable name with underscore-prefixed version
    const regex = new RegExp(`\b${err.var}\b`, 'g');
    lines[lineIdx] = line.replace(regex, `_${err.var}`);
    
    console.log(`Fixed ${file}:${err.line} - ${err.var}`);
  });
  
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
});

console.log('Done!');
