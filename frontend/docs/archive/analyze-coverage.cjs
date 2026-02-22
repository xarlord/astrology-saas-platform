const fs = require('fs');
const rawData = JSON.parse(fs.readFileSync('./coverage/coverage-final.json', 'utf8'));

let totalStatements = 0, coveredStatements = 0;
let totalFunctions = 0, coveredFunctions = 0;
let totalBranches = 0, coveredBranches = 0;

const fileStats = [];

Object.values(rawData).forEach(file => {
  // Count statements
  const stmts = Object.keys(file.s || {}).length;
  const coveredS = Object.values(file.s || {}).filter(v => v > 0).length;
  totalStatements += stmts;
  coveredStatements += coveredS;

  // Count functions
  const funcs = Object.keys(file.f || {}).length;
  const coveredF = Object.values(file.f || {}).filter(v => v > 0).length;
  totalFunctions += funcs;
  coveredFunctions += coveredF;

  // Count branches
  const branches = Object.keys(file.b || {}).reduce((acc, k) => acc + (Array.isArray(file.b[k]) ? file.b[k].length : 0), 0);
  const coveredB = Object.keys(file.b || {}).reduce((acc, k) => acc + (Array.isArray(file.b[k]) ? file.b[k].filter(v => v > 0).length : 0), 0);
  totalBranches += branches;
  coveredBranches += coveredB;

  // Track individual file stats - clean path
  const pathParts = file.path.split(/[\/\\]/);
  const srcIndex = pathParts.indexOf('src');
  let fileName = srcIndex >= 0 ? pathParts.slice(srcIndex + 1).join('/') : pathParts[pathParts.length - 1];

  // Skip test files and config files
  if (!fileName.includes('__tests__') && !fileName.includes('.test.') && !fileName.includes('.eslintrc') && !fileName.includes('vite.config') && !fileName.includes('postcss')) {
    const stmtPct = stmts > 0 ? Math.round((coveredS / stmts) * 100) : 100;
    const funcPct = funcs > 0 ? Math.round((coveredF / funcs) * 100) : 100;
    const branchPct = branches > 0 ? Math.round((coveredB / branches) * 100) : 100;

    if (stmtPct < 70) {
      fileStats.push({
        path: fileName,
        statements: stmtPct,
        functions: funcPct,
        branches: branchPct,
        rawStmts: stmts,
        rawCovered: coveredS
      });
    }
  }
});

console.log('=== OVERALL COVERAGE ===');
console.log('Statements:', totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) + '% (' + coveredStatements + '/' + totalStatements + ')' : '0%');
console.log('Functions:', totalFunctions > 0 ? Math.round((coveredFunctions / totalFunctions) * 100) + '% (' + coveredFunctions + '/' + totalFunctions + ')' : '0%');
console.log('Branches:', totalBranches > 0 ? Math.round((coveredBranches / totalBranches) * 100) + '% (' + coveredBranches + '/' + totalBranches + ')' : '0%');
console.log('');

console.log('=== FILES WITH LOW COVERAGE (<70% Statements) - Sorted by Coverage ===');
const lowCoverage = fileStats.sort((a, b) => a.statements - b.statements);
lowCoverage.slice(0, 50).forEach(f => {
  console.log(f.path + ' - Stmt: ' + f.statements + '%, Funcs: ' + f.functions + '%, Branches: ' + f.branches + '%');
});
console.log('');
console.log('Total low coverage files:', lowCoverage.length);

console.log('');
console.log('=== CRITICAL FILES (Auth, API, Data) WITH LOW COVERAGE ===');
const criticalPatterns = ['auth', 'api', 'service', 'user', 'chart', 'transit', 'store', 'controller', 'hook'];
const critical = lowCoverage.filter(f =>
  criticalPatterns.some(p => f.path.toLowerCase().includes(p))
);
critical.forEach(f => {
  console.log(f.path + ' - Statements: ' + f.statements + '%');
});

console.log('');
console.log('');
console.log('=== FILES WITH 0% COVERAGE ===');
const zeroCoverage = lowCoverage.filter(f => f.statements === 0).sort((a, b) => a.path.localeCompare(b.path));
zeroCoverage.forEach(f => {
  console.log(f.path);
});
console.log('Total files with 0% coverage:', zeroCoverage.length);

console.log('');
console.log('=== HIGH IMPACT FILES (High Lines but Low Coverage - Priority Targets) ===');
const highImpactLowCoverage = lowCoverage
  .filter(f => f.rawStmts > 30)
  .sort((a, b) => b.rawStmts - a.rawStmts)
  .slice(0, 20);
highImpactLowCoverage.forEach(f => {
  console.log(f.path + ' - ' + f.statements + '% coverage, ' + f.rawStmts + ' statements');
});
