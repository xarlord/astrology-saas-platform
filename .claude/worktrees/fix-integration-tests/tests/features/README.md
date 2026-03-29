# BDD Test Specifications

This directory contains comprehensive Behavior-Driven Development (BDD) test specifications using Cucumber/Gherkin syntax for the Astrological Platform.

## Overview

The test suite covers all major features of the platform:

1. **User Authentication** - Registration, login, logout, session management
2. **Natal Chart Management** - Create, view, edit, delete natal charts
3. **Calendar Feature** - Astrological events, reminders, exports
4. **Lunar Returns** - Monthly forecasts, pattern analysis, emotional tracking
5. **Compatibility Analysis** - Synastry, composite charts, relationship insights
6. **Solar Returns** - Yearly predictions, relocation, pattern tracking

## Directory Structure

```
tests/features/
├── cucumber.conf.js                          # Cucumber configuration
├── README.md                                 # This file
├── user_authentication.feature               # Authentication scenarios
├── natal_chart_management.feature            # Natal chart scenarios
├── calendar_feature.feature                  # Calendar scenarios
├── lunar_returns.feature                     # Lunar return scenarios
├── compatibility_analysis.feature            # Compatibility scenarios
├── solar_returns.feature                     # Solar return scenarios
└── step_definitions/
    ├── authentication.steps.js              # Authentication step definitions
    ├── natal_chart.steps.js                 # Natal chart step definitions
    ├── calendar.steps.js                    # Calendar step definitions
    ├── lunar_returns.steps.js               # Lunar return step definitions
    ├── compatibility.steps.js               # Compatibility step definitions
    └── solar_returns.steps.js               # Solar return step definitions
```

## Feature Files

### 1. user_authentication.feature
Tests for user authentication including:
- User registration with validation
- Login with valid/invalid credentials
- Logout functionality
- Session management and timeout
- Remember me functionality

**Key Scenarios:**
- Successful registration with valid data
- Failed registration with existing email
- Password validation and mismatch handling
- Login with valid and invalid credentials
- Session timeout after inactivity

### 2. natal_chart_management.feature
Tests for natal chart management including:
- Creating charts with birth data
- Viewing chart interpretations
- Editing chart information
- Managing multiple charts
- Exporting charts

**Key Scenarios:**
- Create chart with all required data
- Create chart with unknown birth time
- View planetary positions and aspects
- Edit chart birth information
- Export chart as PDF

### 3. calendar_feature.feature
Tests for calendar functionality including:
- Viewing astrological events
- Setting reminders
- Personal transits
- Exporting calendar data

**Key Scenarios:**
- View monthly calendar with events
- Set reminders for events
- Filter events by type
- Export to iCal and Google Calendar
- View personal transits

### 4. lunar_returns.feature
Tests for lunar return calculations including:
- Calculating next lunar return
- Monthly forecasts
- Pattern analysis
- Emotional tracking

**Key Scenarios:**
- Calculate next lunar return
- View monthly forecast
- Compare multiple lunar returns
- Track emotional patterns
- Set reminders for lunar returns

### 5. compatibility_analysis.feature
Tests for compatibility features including:
- Synastry analysis
- Composite charts
- Relationship type comparisons
- Karmic connections

**Key Scenarios:**
- Compare with another user's chart
- View compatibility scores
- Analyze synastry aspects
- Compare business/friendship/romantic compatibility
- View karmic connections

### 6. solar_returns.feature
Tests for solar return features including:
- Yearly solar return calculation
- Relocation options
- Pattern tracking
- Timing techniques

**Key Scenarios:**
- Calculate solar return for current year
- Relocate solar return to different locations
- Compare multiple relocation options
- Track yearly patterns
- View monthly breakdown

## Step Definitions

Each feature file has corresponding step definitions in JavaScript:

### authentication.steps.js
Implements steps for:
- User registration and validation
- Login and authentication
- Logout and session management
- Password security

### natal_chart.steps.js
Implements steps for:
- Creating natal charts
- Viewing chart details
- Editing and deleting charts
- Export functionality

### calendar.steps.js
Implements steps for:
- Viewing calendar events
- Managing reminders
- Filtering and searching
- Exporting calendar data

### lunar_returns.steps.js
Implements steps for:
- Calculating lunar returns
- Viewing forecasts
- Pattern analysis
- Emotional tracking

### compatibility.steps.js
Implements steps for:
- Comparing charts
- Analyzing synastry
- Composite chart generation
- Relationship insights

### solar_returns.steps.js
Implements steps for:
- Calculating solar returns
- Relocation analysis
- Yearly patterns
- Timing techniques

## Running Tests

### Install Dependencies

```bash
npm install --save-dev @cucumber/cucumber cucumber-html-reporter
```

### Run All Tests

```bash
npm test
```

### Run Specific Feature

```bash
npm test -- --features "tests/features/user_authentication.feature"
```

### Run Specific Scenarios by Tag

```bash
npm test -- --tags "@smoke"
npm test -- --tags "@auth"
npm test -- --tags "@critical and not @slow"
```

### Generate HTML Report

```bash
npm test -- --format html:cucumber-report.html
```

## Test Data

The tests use data tables and scenario outlines for data-driven testing:

### Example Data Table

```gherkin
Then I should see the following planetary positions:
  | Planet    | Sign    | Degree  | House   |
  | Sun       | Taurus  | 25.32   | 1       |
  | Moon      | Cancer  | 12.45   | 3       |
```

### Example Scenario Outline

```gherkin
Scenario Outline: Registration validation with various email formats
  When I enter the email "<email>"
  Then I should see the validation message "<message>"

  Examples:
    | email                | message                           |
    | invalid              | Invalid email format              |
    | @example.com         | Invalid email format              |
```

## Tags

Tests are organized using tags for easy filtering:

- `@smoke` - Critical smoke tests
- `@auth` - Authentication tests
- `@chart` - Natal chart tests
- `@calendar` - Calendar feature tests
- `@lunar` - Lunar return tests
- `@compatibility` - Compatibility analysis tests
- `@solar` - Solar return tests
- `@slow` - Slow-running tests (increased timeout)
- `@api-only` - Tests that don't require browser
- `@requires-auth` - Tests that require authentication
- `@requires-chart` - Tests that require a natal chart

## Configuration

The `cucumber.conf.js` file contains:

- Global hooks (BeforeAll, AfterAll)
- Scenario hooks (Before, After)
- Tagged hooks for specific scenarios
- Helper functions for creating test data
- Browser and database initialization
- Screenshot capture on failures

## Test Environment

Tests use a mock/test environment:

- **Test Database**: Clean database for each scenario
- **Test Browser**: Headless browser for UI tests
- **Test Services**: Mocked services for deterministic testing
- **Test Data**: Generated and cleaned up for each scenario

## Best Practices

1. **Gherkin Syntax**: Use Given-When-Then format consistently
2. **Descriptive Scenarios**: Name scenarios clearly to describe what is being tested
3. **Data Tables**: Use data tables for complex test data
4. **Scenario Outlines**: Use outlines for data-driven testing
5. **Background**: Use Background sections for common setup
6. **Tags**: Organize tests with tags for easy filtering
7. **Step Reuse**: Reuse steps across scenarios when possible
8. **Cleanup**: Ensure proper cleanup in After hooks

## Coverage

The test suite covers:

- ✅ All user authentication flows
- ✅ All natal chart CRUD operations
- ✅ All calendar features
- ✅ All lunar return calculations
- ✅ All compatibility analysis types
- ✅ All solar return features
- ✅ Edge cases and error handling
- ✅ Data validation
- ✅ User permissions and access control

## Maintenance

When adding new features:

1. Create a new `.feature` file in the `tests/features/` directory
2. Create corresponding step definitions in `step_definitions/`
3. Add appropriate tags to scenarios
4. Update this README with the new feature information
5. Run tests to ensure they pass

## Troubleshooting

### Common Issues

**Tests timing out:**
- Add `@slow` tag to increase timeout
- Check if test environment is responsive

**Browser not launching:**
- Ensure browser drivers are installed
- Check browser compatibility

**Database connection issues:**
- Verify test database is running
- Check connection strings in configuration

**Step not found:**
- Ensure step is defined in step definitions file
- Check for typos in step text

## Contributing

When adding new tests:

1. Follow the existing pattern and structure
2. Use descriptive scenario names
3. Include edge cases and error conditions
4. Add appropriate tags
5. Document complex test logic
6. Ensure tests are independent and can run in any order

## Resources

- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Cucumber.js](https://github.com/cucumber/cucumber-js)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
