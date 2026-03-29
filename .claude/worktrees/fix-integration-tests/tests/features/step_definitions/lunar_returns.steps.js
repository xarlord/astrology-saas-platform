const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Lunar Returns Setup

Given('I have a natal chart with:', async function(dataTable) {
  const chartData = {};
  dataTable.hashes().forEach(row => {
    chartData[row.Field] = row.Value;
  });
  this.natalChart = await this.createNatalChart(chartData);
});

Given('I am on the {string} page', async function(pageName) {
  this.page = await this.browser.navigateTo(`/${pageName.toLowerCase().replace(/ /g, '-')}`);
  this.currentPage = pageName;
});

When('I request the next lunar return', async function() {
  await this.page.calculateNextLunarReturn();
  this.lunarReturn = await this.page.getLunarReturnData();
});

Then('I should see the next lunar return date', async function() {
  assert.ok(this.lunarReturn.date, 'Should show lunar return date');
});

Then('I should see the exact time of the return', async function() {
  assert.ok(this.lunarReturn.time, 'Should show exact time');
});

Then('I should see the location of the return', async function() {
  assert.ok(this.lunarReturn.location, 'Should show location');
});

Then('I should see the lunar return chart preview', async function() {
  assert.ok(this.lunarReturn.chart, 'Should show chart preview');
});

Then('the data should include:', async function(dataTable) {
  dataTable.hashes().forEach(row => {
    const actual = this.lunarReturn[row.Field];
    assert.ok(actual, `Should have ${row.Field}`);
    if (row.Value) {
      assert.ok(actual.includes(row.Value) || actual === row.Value, `${row.Field} should match`);
    }
  });
});

// Monthly Forecast

Given('I have calculated my lunar return for {string}', async function(monthYear) {
  this.lunarReturn = await this.lunarReturnService.calculate(monthYear);
});

Given('I am on the lunar return details page', async function() {
  this.page = await this.browser.navigateTo(`/lunar-returns/${this.lunarReturn.id}`);
});

When('I click the {string} tab', async function(tabName) {
  await this.page.clickTab(tabName);
});

Then('I should see a forecast for the lunar month', async function() {
  const forecast = await this.page.getMonthlyForecast();
  assert.ok(forecast, 'Should show monthly forecast');
});

Then('I should see the emotional themes for the month', async function() {
  const themes = await this.page.getEmotionalThemes();
  assert.ok(themes && themes.length > 0, 'Should show emotional themes');
});

Then('I should see key dates:', async function(dataTable) {
  const keyDates = await this.page.getKeyDates();
  dataTable.hashes().forEach(expected => {
    const actual = keyDates.find(d => d.date === expected.Date);
    assert.ok(actual, `Should have key date for ${expected.Date}`);
    assert.ok(actual.theme.includes(expected.Theme), `Theme should match for ${expected.Date}`);
  });
});

Then('I should see recommended activities for each theme', async function() {
  const themes = await this.page.getEmotionalThemes();
  themes.forEach(theme => {
    assert.ok(theme.activities && theme.activities.length > 0, `Should have activities for ${theme.name}`);
  });
});

Then('I should see potential challenges', async function() {
  const challenges = await this.page.getChallenges();
  assert.ok(challenges && challenges.length > 0, 'Should show potential challenges');
});

// Past Lunar Returns

When('I select the {string} tab', async function(tabName) {
  await this.page.clickTab(tabName);
});

Then('I should see a list of past lunar returns:', async function(dataTable) {
  const history = await this.page.getLunarReturnHistory();
  dataTable.hashes().forEach(expected => {
    const actual = history.find(h => h.month === expected.Month);
    assert.ok(actual, `Should have entry for ${expected.Month}`);
    assert.ok(actual.date === expected.Date, `Date should match for ${expected.Month}`);
    assert.ok(actual.keyEvents.includes(expected['Key Events']), 'Key events should match');
  });
});

Then('I should be able to click on each for details', async function() {
  const history = await this.page.getLunarReturnHistory();
  history.forEach(entry => {
    assert.ok(entry.clickable, 'Each entry should be clickable');
  });
});

// Compare Multiple Lunar Returns

Given('I have viewed my last {int} lunar returns', async function(count) {
  this.lunarReturns = await this.lunarReturnService.getLastN(count);
});

When('I select {string}', async function(action) {
  await this.page.selectAction(action);
});

When('I select {int} consecutive months', async function(count) {
  await this.page.selectMonths(count);
  this.comparisonMonths = count;
});

Then('I should see a comparison view', async function() {
  const comparison = await this.page.getComparisonView();
  assert.ok(comparison, 'Should show comparison view');
});

Then('I should see recurring themes', async function() {
  const recurringThemes = await this.page.getRecurringThemes();
  assert.ok(recurringThemes && recurringThemes.length > 0, 'Should show recurring themes');
});

Then('I should see progression of house positions', async function() {
  const progression = await this.page.getHouseProgression();
  assert.ok(progression, 'Should show house progression');
});

Then('I should see aspects that repeat', async function() {
  const repeatingAspects = await this.page.getRepeatingAspects();
  assert.ok(repeatingAspects && repeatingAspects.length > 0, 'Should show repeating aspects');
});

Then('I should see a pattern analysis', async function() {
  const patterns = await this.page.getPatternAnalysis();
  assert.ok(patterns, 'Should show pattern analysis');
});

// Reminders for Lunar Returns

Given('I have calculated my next lunar return for {string}', async function(date) {
  this.lunarReturn = await this.lunarReturnService.calculateForDate(date);
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

When('I select {string} as reminder time', async function(time) {
  await this.page.selectReminderTime(time);
  this.reminderTime = time;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('a reminder should be created', async function() {
  const reminder = await this.reminderService.getLunarReturnReminder(this.lunarReturn.id);
  assert.ok(reminder, 'Reminder should be created');
});

Then('I should receive a notification on {string}', async function(date) {
  const reminder = await this.reminderService.getLunarReturnReminder(this.lunarReturn.id);
  assert.ok(reminder.reminderDate.includes(date), 'Reminder should be set for correct date');
});

Then('the notification should include preparation tips', async function() {
  const reminder = await this.reminderService.getLunarReturnReminder(this.lunarReturn.id);
  assert.ok(reminder.message.includes('preparation') || reminder.tips, 'Should include preparation tips');
});

// Lunar Return Chart Interpretation

When('I click the {string} button', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('I should see detailed insights', async function() {
  const insights = await this.page.getDetailedInsights();
  assert.ok(insights && insights.length > 0, 'Should show detailed insights');
});

Then('I should see the house focus for the month', async function() {
  const houseFocus = await this.page.getHouseFocus();
  assert.ok(houseFocus, 'Should show house focus');
});

Then('I should see dominant elements', async function() {
  const elements = await this.page.getDominantElements();
  assert.ok(elements && elements.length > 0, 'Should show dominant elements');
});

Then('I should see key aspects:', async function(dataTable) {
  const aspects = await this.page.getAspects();
  dataTable.hashes().forEach(expected => {
    const actual = aspects.find(a =>
      a.aspect === expected.Aspect &&
      a.planets.includes(expected.Planets.split('&')[0].trim()) &&
      a.planets.includes(expected.Planets.split('&')[1].trim())
    );
    assert.ok(actual, `Should have ${expected.Aspect} aspect for ${expected.Planets}`);
    assert.ok(actual.meaning.includes(expected.Meaning), 'Meaning should match');
  });
});

Then('I should see recommendations for the month', async function() {
  const recommendations = await this.page.getRecommendations();
  assert.ok(recommendations && recommendations.length > 0, 'Should show recommendations');
});

// Calculate Lunar Return for Specific Location

When('I select {string}', async function(action) {
  await this.page.selectAction(action);
});

When('I enter {string}', async function(location) {
  await this.page.fillField('location', location);
  this.location = location;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('I should see the lunar return time for {string}', async function(location) {
  const lunarReturn = await this.page.getLunarReturnData();
  assert.ok(lunarReturn.location.includes(location), `Location should be ${location}`);
});

Then('I should see the house positions adjusted for {string}', async function(location) {
  const positions = await this.page.getHousePositions();
  assert.ok(positions.location === location, 'Positions should be adjusted for location');
});

Then('I should see the ascendant for {string} location', async function(location) {
  const ascendant = await this.page.getAscendant();
  assert.ok(ascendant.location === location, 'Ascendant should be for specified location');
});

Then('I should be able to compare with my natal location', async function() {
  const comparison = await this.page.getLocationComparison();
  assert.ok(comparison, 'Should be able to compare locations');
});

// Emotional Forecast Themes

Given('I am viewing a lunar return for {string}', async function(monthYear) {
  this.lunarReturn = await this.lunarReturnService.calculate(monthYear);
});

Given('the Moon is in the {int} house', async function(houseNumber) {
  this.lunarReturn.moonHouse = houseNumber;
});

When('I view the forecast', async function() {
  this.forecast = await this.page.getForecast();
});

Then('I should see {string} as a primary theme', async function(theme) {
  assert.ok(this.forecast.primaryTheme.includes(theme), 'Should show correct primary theme');
});

Then('I should see related recommendations:', async function(dataTable) {
  const recommendations = await this.page.getRecommendations();
  dataTable.hashes().forEach(expected => {
    const actual = recommendations.find(r => r.activity.includes(expected.Recommendation));
    assert.ok(actual, `Should have recommendation for ${expected.Recommendation}`);
    assert.strictEqual(actual.priority, expected.Priority, 'Priority should match');
  });
});

// Track Emotional Patterns

Given('I have viewed {int} consecutive lunar returns', async function(count) {
  this.lunarReturns = await this.lunarReturnService.getLastN(count);
});

Given('I am on the {string} page', async function(pageName) {
  this.page = await this.browser.navigateTo(`/${pageName.toLowerCase().replace(/ /g, '-')}`);
});

Then('I should see a graph of emotional cycles', async function() {
  const graph = await this.page.getEmotionalCyclesGraph();
  assert.ok(graph, 'Should show emotional cycles graph');
});

Then('I should see high and low periods marked', async function() {
  const periods = await this.page.getEmotionalPeriods();
  assert.ok(periods.high && periods.high.length > 0, 'Should show high periods');
  assert.ok(periods.low && periods.low.length > 0, 'Should show low periods');
});

Then('I should see average emotional intensity', async function() {
  const intensity = await this.page.getAverageEmotionalIntensity();
  assert.ok(typeof intensity === 'number', 'Should show average intensity');
});

Then('I should see recurring themes:', async function(dataTable) {
  const themes = await this.page.getRecurringThemes();
  dataTable.hashes().forEach(expected => {
    const actual = themes.find(t => t.theme === expected.Theme);
    assert.ok(actual, `Should have theme ${expected.Theme}`);
    assert.strictEqual(actual.frequency, expected.Frequency, 'Frequency should match');
    assert.ok(actual.months.includes(expected.Months), 'Should include correct months');
  });
});

// Lunar Return Aspects to Natal Chart

When('I click the {string} tab', async function(tabName) {
  await this.page.clickTab(tabName);
});

Then('I should see aspects between lunar return and natal chart', async function() {
  const aspects = await this.page.getSynastryAspects();
  assert.ok(aspects && aspects.length > 0, 'Should show synastry aspects');
});

Then('I should see:', async function(dataTable) {
  const aspects = await this.page.getSynastryAspects();
  dataTable.hashes().forEach(expected => {
    const actual = aspects.find(a =>
      a.returnPlanet === expected['Return Planet'] &&
      a.natalPlanet === expected['Natal Planet'] &&
      a.aspect === expected.Aspect
    );
    assert.ok(actual, `Should have aspect between ${expected['Return Planet']} and ${expected['Natal Planet']}`);
    assert.strictEqual(actual.orb, expected.Orb, 'Or should match');
  });
});

Then('I should see interpretation of each aspect', async function() {
  const aspects = await this.page.getSynastryAspects();
  aspects.forEach(aspect => {
    assert.ok(aspect.interpretation, `Aspect should have interpretation`);
  });
});

// Create Lunar Return Journal Entry

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

When('I enter my thoughts for the lunar month', async function() {
  await this.page.fillField('thoughts', 'This month I feel emotionally balanced...');
  this.journalEntry = { thoughts: 'This month I feel emotionally balanced...' };
});

When('I set goals for the month', async function() {
  await this.page.fillField('goals', 'Focus on self-care and emotional growth');
  this.journalEntry.goals = 'Focus on self-care and emotional growth';
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('the journal entry should be saved', async function() {
  const entry = await this.journalService.getLatestEntry(this.lunarReturn.id);
  assert.ok(entry, 'Journal entry should be saved');
});

Then('I should be able to reference it later', async function() {
  const entry = await this.journalService.getLatestEntry(this.lunarReturn.id);
  assert.ok(entry, 'Should be able to retrieve journal entry');
});

Then('I should see it linked to the lunar return', async function() {
  const entry = await this.journalService.getLatestEntry(this.lunarReturn.id);
  assert.strictEqual(entry.lunarReturnId, this.lunarReturn.id, 'Entry should be linked to lunar return');
});

// Export Lunar Return Report

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

When('I select {string} format', async function(format) {
  await this.page.selectOption(format);
  this.exportFormat = format;
});

When('I include charts and interpretations', async function() {
  await this.page.checkOption('includeCharts');
  await this.page.checkOption('includeInterpretations');
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('a PDF report should be generated', async function() {
  const downloadedFile = await this.browser.getDownloadedFile();
  assert.ok(downloadedFile.name.endsWith('.pdf'), 'Should download PDF file');
});

Then('the PDF should contain the lunar return chart', async function() {
  const pdfContent = await this.browser.getPDFContent();
  assert.ok(pdfContent.includes('chart') || pdfContent.includes('Chart'), 'PDF should contain chart');
});

Then('the PDF should contain the monthly forecast', async function() {
  const pdfContent = await this.browser.getPDFContent();
  assert.ok(pdfContent.includes('forecast') || pdfContent.includes('Forecast'), 'PDF should contain forecast');
});

Then('the PDF should contain aspect interpretations', async function() {
  const pdfContent = await this.browser.getPDFContent();
  assert.ok(pdfContent.includes('aspect') || pdfContent.includes('Aspect'), 'PDF should contain aspects');
});

Then('the PDF should contain recommendations', async function() {
  const pdfContent = await this.browser.getPDFContent();
  assert.ok(pdfContent.includes('recommendation') || pdfContent.includes('Recommendation'), 'PDF should contain recommendations');
});

// Lunar Return Themes by House

Given('I have a lunar return with Moon in the {string}', async function(house) {
  this.lunarReturn = await this.createLunarReturn({ moonHouse: parseInt(house) });
});

When('I view the monthly forecast', async function() {
  this.forecast = await this.page.getForecast();
});

Then('the primary theme should be {string}', async function(theme) {
  assert.strictEqual(this.forecast.primaryTheme, theme, 'Primary theme should match');
});

Then('I should see appropriate recommendations', async function() {
  const recommendations = await this.page.getRecommendations();
  assert.ok(recommendations && recommendations.length > 0, 'Should have recommendations');
});

// View Lunar Return Phase

Then('I should see the lunar phase at the time of return', async function() {
  const phase = await this.page.getLunarPhase();
  assert.ok(phase, 'Should show lunar phase');
});

Then('I should see if it\'s a New, Waxing, Full, or Waning phase', async function() {
  const phase = await this.page.getLunarPhase();
  assert.ok(['New', 'Waxing', 'Full', 'Waning'].includes(phase.type), 'Phase type should be valid');
});

Then('I should see how the phase affects the lunar month', async function() {
  const effect = await this.page.getPhaseEffect();
  assert.ok(effect, 'Should show phase effect');
});

Then('I should see phase-specific recommendations', async function() {
  const recommendations = await this.page.getPhaseRecommendations();
  assert.ok(recommendations && recommendations.length > 0, 'Should have phase-specific recommendations');
});

// Compare Lunar Return with Solar Return

Given('I have viewed my lunar return for {string}', async function(monthYear) {
  this.lunarReturn = await this.lunarReturnService.calculate(monthYear);
});

Given('I have viewed my solar return for {int}', async function(year) {
  this.solarReturn = await this.solarReturnService.calculate(year);
});

When('I click {string}', async function(action) {
  await this.page.selectAction(action);
});

Then('I should see side-by-side comparison', async function() {
  const comparison = await this.page.getComparison();
  assert.ok(comparison.lunar && comparison.solar, 'Should show both returns');
});

Then('I should see how lunar themes align with solar themes', async function() {
  const alignment = await this.page.getThemeAlignment();
  assert.ok(alignment, 'Should show theme alignment');
});

Then('I should see integrated recommendations', async function() {
  const recommendations = await this.page.getIntegratedRecommendations();
  assert.ok(recommendations && recommendations.length > 0, 'Should have integrated recommendations');
});

Then('I should see priority focus areas for the year', async function() {
  const priorities = await this.page.getPriorityAreas();
  assert.ok(priorities && priorities.length > 0, 'Should have priority focus areas');
});
