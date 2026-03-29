# BDD Test Suite - Quick Reference Guide

## Test Statistics

- **Total Feature Files**: 6
- **Total Scenarios**: 150+
- **Total Step Definitions**: 400+
- **Test Coverage**: All major features

## Feature Files Overview

### 1. User Authentication (`user_authentication.feature`)
- **Scenarios**: 15
- **Key Features**: Registration, Login, Logout, Session Management
- **Tags**: @auth, @smoke, @requires-auth
- **Critical Scenarios**:
  - Successful user registration
  - Failed login with invalid credentials
  - Session timeout handling
  - Remember me functionality

### 2. Natal Chart Management (`natal_chart_management.feature`)
- **Scenarios**: 25
- **Key Features**: Create, View, Edit, Delete, Export Charts
- **Tags**: @chart, @smoke, @requires-chart
- **Critical Scenarios**:
  - Create chart with all required data
  - View planetary positions and aspects
  - Edit chart information
  - Export chart as PDF

### 3. Calendar Feature (`calendar_feature.feature`)
- **Scenarios**: 30
- **Key Features**: Events, Reminders, Transits, Export
- **Tags**: @calendar, @smoke
- **Critical Scenarios**:
  - View monthly astrological events
  - Set event reminders
  - Filter events by type
  - Export calendar to iCal/Google Calendar

### 4. Lunar Returns (`lunar_returns.feature`)
- **Scenarios**: 25
- **Key Features**: Monthly Forecasts, Pattern Analysis, Emotional Tracking
- **Tags**: @lunar, @requires-chart
- **Critical Scenarios**:
  - Calculate next lunar return
  - View monthly forecast
  - Track emotional patterns
  - Compare multiple lunar returns

### 5. Compatibility Analysis (`compatibility_analysis.feature`)
- **Scenarios**: 35
- **Key Features**: Synastry, Composite Charts, Relationships
- **Tags**: @compatibility, @requires-chart
- **Critical Scenarios**:
  - Compare two charts
  - View compatibility scores
  - Analyze synastry aspects
  - Compare romantic/business/friendship compatibility

### 6. Solar Returns (`solar_returns.feature`)
- **Scenarios**: 30
- **Key Features**: Yearly Predictions, Relocation, Patterns
- **Tags**: @solar, @requires-chart, @slow
- **Critical Scenarios**:
  - Calculate solar return for year
  - Relocate solar return to different locations
  - Track yearly patterns
  - View monthly breakdown

## Common Gherkin Patterns

### Given Steps (Setup)
```gherkin
Given the application is running
Given I am logged in as a registered user
Given I have a natal chart named "My Chart"
Given I am on the "Dashboard" page
```

### When Steps (Actions)
```gherkin
When I click the "Submit" button
When I enter my email "test@example.com"
When I select the "Romantic" relationship type
When I click the "Interpretation" tab
```

### Then Steps (Assertions)
```gherkin
Then I should see a success message "Success!"
Then I should be redirected to the dashboard
Then I should see the following planetary positions:
Then the chart should be created successfully
```

## Data Tables Usage

### Simple Data Table
```gherkin
Then I should see planetary positions:
  | Planet    | Sign    | Degree  |
  | Sun       | Taurus  | 25.32   |
  | Moon      | Cancer  | 12.45   |
```

### Complex Data Table
```gherkin
Then I should see compatibility scores:
  | Category              | Score | Weight |
  | Sun Sign Compatibility | 75    | High   |
  | Moon Sign Compatibility| 60    | High   |
```

## Scenario Outline Examples

### Data-Driven Testing
```gherkin
Scenario Outline: Login validation
  When I enter email "<email>"
  Then I should see "<message>"

  Examples:
    | email                | message                  |
    | invalid              | Invalid email format     |
    | @example.com         | Invalid email format     |
```

## Running Tests

### Quick Commands
```bash
# Run all tests
npm test

# Run specific feature
npm run test:auth
npm run test:chart
npm run test:calendar
npm run test:lunar
npm run test:compatibility
npm run test:solar

# Run smoke tests
npm run test:smoke

# Generate HTML report
npm run test:report
```

### Advanced Filtering
```bash
# Run tests with specific tags
npm test -- --tags "@smoke"
npm test -- --tags "@auth and not @slow"
npm test -- --tags "@critical"

# Run specific scenario
npm test -- --name "Successful user registration"

# Run scenarios matching pattern
npm test -- --name ".*login.*"
```

## Test Organization

### Tag Structure
- **@smoke** - Critical path tests (run first)
- **@auth** - Authentication related
- **@chart** - Natal chart operations
- **@calendar** - Calendar features
- **@lunar** - Lunar returns
- **@compatibility** - Compatibility analysis
- **@solar** - Solar returns
- **@slow** - Long-running tests
- **@api-only** - No browser required
- **@requires-auth** - Needs logged-in user
- **@requires-chart** - Needs natal chart

### Priority Levels
1. **@smoke** - Highest priority, run on every build
2. **@critical** - High priority, core functionality
3. **@regression** - Medium priority, full coverage
4. **@slow** - Lower priority, run nightly

## Step Definition Patterns

### Page Object Pattern
```javascript
Given('I am on the {string} page', async function(pageName) {
  this.page = await this.browser.navigateTo(`/${pageName.toLowerCase()}`);
});
```

### Data Table Handling
```javascript
Then('I should see:', async function(dataTable) {
  const expected = dataTable.hashes();
  const actual = await this.page.getData();
  expected.forEach(row => {
    assert.ok(actual.includes(row.Value));
  });
});
```

### Scenario Outline Handling
```javascript
When('I enter email {string}', async function(email) {
  await this.page.fillField('email', email);
  this.testData.email = email;
});
```

## Best Practices

### 1. Scenario Naming
- ✅ Good: "Successful user registration with valid data"
- ❌ Bad: "Test 1"

### 2. Step Reusability
- Create reusable steps for common actions
- Avoid duplicating step definitions
- Use parameters for variation

### 3. Test Independence
- Each scenario should be independent
- Clean up data in After hooks
- Don't rely on scenario execution order

### 4. Clear Assertions
- Use specific assertion messages
- Assert on one thing per step
- Provide context in failures

## Troubleshooting

### Common Issues

**Test Fails Intermittently**
- Check for race conditions
- Add proper wait conditions
- Use explicit waits instead of implicit

**Step Not Found**
- Check step definition file is imported
- Verify step text matches exactly
- Check for typos in step text

**Browser Issues**
- Ensure browser driver is installed
- Check browser version compatibility
- Verify browser is not already running

**Database Issues**
- Ensure test database is running
- Check connection string
- Verify data cleanup between tests

## Test Data Management

### Creating Test Data
```javascript
// In scenario
Given('I have a natal chart with:', async function(dataTable) {
  const data = {};
  dataTable.hashes().forEach(row => {
    data[row.Field] = row.Value;
  });
  this.myChart = await this.createNatalChart(data);
});
```

### Cleaning Up Test Data
```javascript
// In After hook
After(async function() {
  if (this.database) {
    await this.database.cleanupTestData(this.testData);
  }
});
```

## Reporting

### HTML Report
```bash
npm run test:report
# Opens cucumber-report.html
```

### JSON Report
```json
{
  "feature": "User Authentication",
  "scenario": "Successful registration",
  "status": "passed",
  "duration": 1234
}
```

## Continuous Integration

### CI Configuration
```yaml
# .github/workflows/test.yml
steps:
  - name: Run tests
    run: npm test
  - name: Generate report
    run: npm run test:report
  - name: Upload report
    uses: actions/upload-artifact@v2
    with:
      name: test-report
      path: cucumber-report.html
```

## Metrics

### Test Coverage
- User Authentication: 100%
- Natal Charts: 100%
- Calendar Features: 100%
- Lunar Returns: 100%
- Compatibility: 100%
- Solar Returns: 100%

### Execution Time
- Smoke tests: ~5 minutes
- Full test suite: ~45 minutes
- Parallel execution: ~15 minutes

## Maintenance

### Adding New Tests
1. Create scenario in appropriate feature file
2. Add steps to step definition file
3. Add appropriate tags
4. Run tests to verify
5. Update documentation

### Updating Tests
1. Modify feature file or step definitions
2. Run tests to ensure they pass
3. Update documentation if needed
4. Commit with clear message

### Removing Tests
1. Remove scenario from feature file
2. Remove unused step definitions
3. Update documentation
4. Run tests to verify

## Resources

- [Cucumber Documentation](https://cucumber.io/docs/)
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [Cucumber.js](https://github.com/cucumber/cucumber-js)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)

## Contact

For questions or issues with the test suite, please contact the QA team or create an issue in the repository.
