const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));

const failureReasons = {};
const failedTests = [];

Object.values(data.suites || {}).forEach(suite => {
  Object.values(suite.specs || {}).forEach(spec => {
    if (spec.tests) {
      Object.values(spec.tests).forEach(test => {
        if (test.results) {
          const failed = test.results.find(r => r.status === 'failed');
          if (failed) {
            const error = failed.error || 'Unknown error';
            const shortError = error.split('\n')[0].substring(0, 80);

            failureReasons[shortError] = (failureReasons[shortError] || 0) + 1;
            failedTests.push({ name: test.name, error: shortError });
          }
        }
      });
    }
  });
});

console.log('=== Top Failure Reasons ===');
Object.entries(failureReasons)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([reason, count], i) => {
    console.log(`${i + 1}. ${count} tests: ${reason}`);
  });

console.log('\n=== Sample of Failed Tests ===');
failedTests.slice(0, 30).forEach((test, i) => {
  console.log(`${i + 1}. ${test.name}`);
  console.log(`   Error: ${test.error}`);
  console.log();
});
