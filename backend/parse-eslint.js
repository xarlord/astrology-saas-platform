const data = require('./eslint-out.json');
const files = {};
for (const f of data) {
  const msgs = f.messages.filter(m => m.ruleId === '@typescript-eslint/no-explicit-any');
  if (msgs.length > 0) {
    let rel = f.filePath;
    const cwd = process.cwd();
    if (rel.startsWith(cwd + '\\')) rel = rel.slice(cwd.length + 1);
    if (rel.startsWith(cwd + '/')) rel = rel.slice(cwd.length + 1);
    files[rel] = msgs.length;
  }
}
const sorted = Object.entries(files).sort((a, b) => b[1] - a[1]);
console.log('Total files:', sorted.length);
console.log('Total warnings:', sorted.reduce((s, e) => s + e[1], 0));
for (const [f, c] of sorted) console.log(c.toString().padStart(3), f);
