const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Solar Returns Setup

Given('I have a natal chart with:', async function(dataTable) {
  const chartData = {};
  dataTable.hashes().forEach(row => {
    chartData[row.Field] = row.Value;
  });
  this.myChart = await this.createNatalChart(chartData);
});

Given('I am on the {string} page', async function(pageName) {
  this.page = await this.browser.navigateTo(`/${pageName.toLowerCase().replace(/ /g, '-')}`);
  this.currentPage = pageName;
});

Given('I want to view my solar return for {int}', async function(year) {
  this.targetYear = year;
});

When('I select the year {string}', async function(year) {
  await this.page.selectYear(year);
  this.selectedYear = year;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('I should see the solar return date', async function() {
  const solarReturn = await this.page.getSolarReturnData();
  assert.ok(solarReturn.date, 'Should show solar return date');
});

Then('I should see the exact time of the solar return', async function() {
  const solarReturn = await this.page.getSolarReturnData();
  assert.ok(solarReturn.time, 'Should show exact time');
});

Then('I should see the solar return chart', async function() {
  const chart = await this.page.getSolarReturnChart();
  assert.ok(chart, 'Should show solar return chart');
});

Then('I should see:', async function(dataTable) {
  const solarReturn = await this.page.getSolarReturnData();
  dataTable.hashes().forEach(row => {
    const actual = solarReturn[row.Field];
    assert.ok(actual, `Should have ${row.Field}`);
    if (row.Value) {
      assert.ok(actual.includes(row.Value) || actual === row.Value, `${row.Field} should be ${row.Value}`);
    }
  });
});

// Solar Return Interpretation

Given('I have calculated my solar return for {int}', async function(year) {
  this.solarReturn = await this.solarReturnService.calculate(year);
});

Given('I am viewing the solar return chart', async function() {
  this.page = await this.browser.navigateTo(`/solar-returns/${this.solarReturn.id}`);
});

When('I click the {string} tab', async function(tabName) {
  await this.page.clickTab(tabName);
});

Then('I should see the year\'s major themes', async function() {
  const themes = await this.page.getMajorThemes();
  assert.ok(themes && themes.length > 0, 'Should show major themes');
});

Then('I should see the house focus for the year', async function() {
  const houseFocus = await this.page.getHouseFocus();
  assert.ok(houseFocus, 'Should show house focus');
});

Then('I should see dominant elements', async function() {
  const elements = await this.page.getDominantElements();
  assert.ok(elements && elements.length > 0, 'Should show dominant elements');
});

Then('I should see key aspects in the solar return chart', async function() {
  const aspects = await this.page.getKeyAspects();
  assert.ok(aspects && aspects.length > 0, 'Should show key aspects');
});

Then('I should see predictions for different life areas:', async function(dataTable) {
  const predictions = await this.page.getPredictions();
  dataTable.hashes().forEach(expected => {
    const actual = predictions.find(p => p.area === expected['Life Area']);
    assert.ok(actual, `Should have prediction for ${expected['Life Area']}`);
    assert.ok(actual.prediction.includes(expected.Prediction), 'Prediction should match');
  });
});

// Relocate Solar Return

Given('the original location is {string}', async function(location) {
  this.originalLocation = location;
});

When('I click {string}', async function(action) {
  await this.page.clickAction(action);
});

When('I enter {string} as new location', async function(location) {
  await this.page.fillField('location', location);
  this.newLocation = location;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('I should see the solar return chart for {string}', async function(location) {
  const chart = await this.page.getSolarReturnChart();
  assert.ok(chart.location.includes(location), `Chart should be for ${location}`);
});

Then('I should see the relocated time', async function() {
  const time = await this.page.getRelocatedTime();
  assert.ok(time, 'Should show relocated time');
});

Then('I should see the new ascendant', async function() {
  const ascendant = await this.page.getAscendant();
  assert.ok(ascendant, 'Should show new ascendant');
});

Then('I should see how houses shift', async function() {
  const houseShifts = await this.page.getHouseShifts();
  assert.ok(houseShifts, 'Should show house shifts');
});

Then('I should see:', async function(dataTable) {
  const locations = await this.page.getLocationComparison();
  dataTable.hashes().forEach(expected => {
    const actual = locations.find(l => l.location === expected.Location);
    assert.ok(actual, `Should have data for ${expected.Location}`);
    assert.ok(actual.ascendant.includes(expected.Ascendant), 'Ascendant should match');
    assert.ok(actual.houseChanges.includes(expected['House Changes']), 'House changes should match');
  });
});

Then('I should see which location is most favorable', async function() {
  const favorable = await this.page.getMostFavorableLocation();
  assert.ok(favorable, 'Should indicate most favorable location');
});

// Compare Multiple Relocation Options

Given('I want to find the best location', async function() {
  this.comparisonMode = true;
});

When('I select {string}', async function(action) {
  await this.page.selectAction(action);
});

When('I enter multiple locations:', async function(dataTable) {
  const locations = dataTable.hashes().map(row => row.Location);
  await this.page.enterLocations(locations);
  this.locationsToCompare = locations;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('I should see a comparison table', async function() {
  const table = await this.page.getComparisonTable();
  assert.ok(table, 'Should show comparison table');
});

Then('I should see ratings for each location:', async function(dataTable) {
  const table = await this.page.getComparisonTable();
  dataTable.hashes().forEach(expected => {
    const row = table.find(r => r.location === expected.Location);
    assert.ok(row, `Should have row for ${expected.Location}`);
    assert.strictEqual(row.career, parseInt(expected.Career), 'Career rating should match');
    assert.strictEqual(row.love, parseInt(expected.Love), 'Love rating should match');
    assert.strictEqual(row.health, parseInt(expected.Health), 'Health rating should match');
    assert.strictEqual(row.travel, parseInt(expected.Travel), 'Travel rating should match');
    assert.strictEqual(parseFloat(row.overall), parseFloat(expected.Overall), 'Overall rating should match');
  });
});

Then('I should see recommendations', async function() {
  const recommendations = await this.page.getRecommendations();
  assert.ok(recommendations && recommendations.length > 0, 'Should show recommendations');
});

// Save Solar Return Chart

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

When('I enter a name {string}', async function(chartName) {
  await this.page.fillField('chartName', chartName);
  this.savedChartName = chartName;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('the solar return should be saved', async function() {
  const chart = await this.solarReturnService.getByName(this.savedChartName);
  assert.ok(chart, 'Solar return should be saved');
});

Then('I should see it in my saved solar returns list', async function() {
  const list = await this.page.getSavedSolarReturns();
  assert.ok(list.some(c => c.name === this.savedChartName), 'Chart should be in saved list');
});

Then('I should be able to access it later', async function() {
  const chart = await this.solarReturnService.getByName(this.savedChartName);
  assert.ok(chart, 'Should be able to access saved chart');
});

// Track Yearly Patterns

Given('I have saved solar returns for multiple years', async function() {
  this.years = [2020, 2021, 2022, 2023, 2024, 2025];
  this.solarReturns = await this.solarReturnService.createMultiple(this.years);
});

When('I click {string}', async function(action) {
  await this.page.clickAction(action);
});

Then('I should see a visual representation of patterns', async function() {
  const visual = await this.page.getPatternVisualization();
  assert.ok(visual, 'Should show pattern visualization');
});

Then('I should see recurring themes', async function() {
  const themes = await this.page.getRecurringThemes();
  assert.ok(themes && themes.length > 0, 'Should show recurring themes');
});

Then('I should see:', async function(dataTable) {
  const table = await this.page.getYearlyTable();
  dataTable.hashes().forEach(expected => {
    const row = table.find(r => r.year === parseInt(expected.Year));
    assert.ok(row, `Should have data for year ${expected.Year}`);
    assert.ok(row.ascendant.includes(expected.Ascendant), 'Ascendant should match');
    assert.ok(row.sunHouse.includes(expected['Sun House']), 'Sun house should match');
    assert.ok(row.theme.includes(expected['Major Theme']), 'Theme should match');
  });
});

Then('I should see long-term cycles', async function() {
  const cycles = await this.page.getLongTermCycles();
  assert.ok(cycles && cycles.length > 0, 'Should show long-term cycles');
});

// Solar Return Aspects to Natal Chart

Then('I should see aspects between solar return and natal chart', async function() {
  const aspects = await this.page.getSynastryAspects();
  assert.ok(aspects && aspects.length > 0, 'Should show aspects');
});

Then('I should see:', async function(dataTable) {
  const aspects = await this.page.getSynastryAspects();
  dataTable.hashes().forEach(expected => {
    const actual = aspects.find(a =>
      a.solarPlanet === expected['Solar Return Planet'] &&
      a.natalPlanet === expected['Natal Planet'] &&
      a.aspect === expected.Aspect
    );
    assert.ok(actual, `Should have aspect between ${expected['Solar Return Planet']} and ${expected['Natal Planet']}`);
    assert.strictEqual(actual.orb, expected.Orb, 'Orb should match');
  });
});

Then('I should see interpretation of each aspect', async function() {
  const aspects = await this.page.getSynastryAspects();
  aspects.forEach(aspect => {
    assert.ok(aspect.meaning, 'Aspect should have interpretation');
  });
});

// Reminders for Solar Return

Given('I have calculated my solar return for {string}', async function(date) {
  this.solarReturn = await this.solarReturnService.calculateForDate(date);
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
  const reminder = await this.reminderService.getSolarReturnReminder(this.solarReturn.id);
  assert.ok(reminder, 'Reminder should be created');
});

Then('I should receive a notification on {string}', async function(date) {
  const reminder = await this.reminderService.getSolarReturnReminder(this.solarReturn.id);
  assert.ok(reminder.reminderDate.includes(date), 'Reminder should be for correct date');
});

Then('the notification should include preparation tips for the year', async function() {
  const reminder = await this.reminderService.getSolarReturnReminder(this.solarReturn.id);
  assert.ok(reminder.tips && reminder.tips.length > 0, 'Should include preparation tips');
});

// Monthly Breakdown

Given('the solar return date is {string}', async function(date) {
  this.solarReturnDate = date;
});

When('I click {string}', async function(action) {
  await this.page.clickAction(action);
});

Then('I should see a month-by-month breakdown', async function() {
  const breakdown = await this.page.getMonthlyBreakdown();
  assert.ok(breakdown && breakdown.length > 0, 'Should show monthly breakdown');
});

Then('I should see key themes for each month:', async function(dataTable) {
  const months = await this.page.getMonthlyBreakdown();
  dataTable.hashes().forEach(expected => {
    const month = months.find(m => m.name.includes(expected.Month));
    assert.ok(month, `Should have data for ${expected.Month}`);
    assert.ok(month.theme.includes(expected['Primary Theme']), 'Theme should match');
    assert.ok(month.keyDates.includes(expected['Key Dates']), 'Key dates should match');
  });
});

Then('I should see transits that activate the solar return', async function() {
  const transits = await this.page.getActivatingTransits();
  assert.ok(transits && transits.length > 0, 'Should show activating transits');
});

// Solar Return House Placements

Then('I should see which solar return planets are in which houses', async function() {
  const placements = await this.page.getHousePlacements();
  assert.ok(placements && placements.length > 0, 'Should show house placements');
});

Then('I should see:', async function(dataTable) {
  const placements = await this.page.getHousePlacements();
  dataTable.hashes().forEach(expected => {
    const actual = placements.find(p => p.planet === expected.Planet);
    assert.ok(actual, `Should have placement for ${expected.Planet}`);
    assert.strictEqual(actual.solarHouse, parseInt(expected['Solar Return House']), 'Solar house should match');
    assert.strictEqual(actual.natalHouse, parseInt(expected['Natal House']), 'Natal house should match');
    assert.ok(actual.meaning.includes(expected.Meaning), 'Meaning should match');
  });
});

Then('I should see interpretations', async function() {
  const placements = await this.page.getHousePlacements();
  placements.forEach(placement => {
    assert.ok(placement.interpretation, 'Each placement should have interpretation');
  });
});

// Compare Solar Return with Lunar Returns

Given('I have lunar returns for the same year', async function() {
  this.lunarReturns = await this.lunarReturnService.getAllForYear(this.solarReturn.year);
});

When('I click {string}', async function(action) {
  await this.page.clickAction(action);
});

Then('I should see how they work together', async function() {
  const interaction = await this.page.getReturnInteraction();
  assert.ok(interaction, 'Should show how returns work together');
});

Then('I should see the interaction between solar and lunar themes', async function() {
  const themes = await this.page.getCombinedThemes();
  assert.ok(themes && themes.length > 0, 'Should show combined themes');
});

Then('I should see a combined forecast', async function() {
  const forecast = await this.page.getCombinedForecast();
  assert.ok(forecast, 'Should show combined forecast');
});

Then('I should see key periods when both align', async function() {
  const periods = await this.page.getAlignedPeriods();
  assert.ok(periods && periods.length > 0, 'Should show aligned periods');
});

// Export Solar Return Report

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

Then('a comprehensive PDF should be generated', async function() {
  const pdf = await this.browser.getDownloadedFile();
  assert.ok(pdf.name.endsWith('.pdf'), 'Should generate PDF');
});

Then('the PDF should contain:', async function(dataTable) {
  const pdfContent = await this.browser.getPDFContent();
  dataTable.hashes().forEach(row => {
    assert.ok(row.Included === 'Yes', `${row.Section} should be included`);
    assert.ok(pdfContent.toLowerCase().includes(row.Section.toLowerCase()), `PDF should contain ${row.Section}`);
  });
});

// Solar Return Themes by Sun House

Given('I have a solar return with Sun in the {string}', async function(house) {
  this.solarReturn = await this.createSolarReturn({ sunHouse: parseInt(house) });
});

When('I view the yearly interpretation', async function() {
  this.interpretation = await this.page.getInterpretation();
});

Then('the primary theme should be {string}', async function(theme) {
  assert.strictEqual(this.interpretation.primaryTheme, theme, 'Primary theme should match');
});

Then('I should see {string} as the main focus area', async function(focus) {
  assert.strictEqual(this.interpretation.mainFocus, focus, 'Main focus should match');
});

// Solar Return Ruler

Given('the ascendant is {string}', async function(ascendant) {
  this.solarReturn.ascendant = ascendant;
});

Given('the ruler of Cancer is the Moon', async function() {
  this.rulerInfo = { sign: 'Cancer', ruler: 'Moon' };
});

When('I click {string}', async function(action) {
  await this.page.clickAction(action);
});

Then('I should see the Moon\'s placement in the solar return', async function() {
  const placement = await this.page.getRulerPlacement();
  assert.ok(placement && placement.planet === 'Moon', 'Should show Moon placement');
});

Then('I should see the Moon\'s house and sign', async function() {
  const placement = await this.page.getRulerPlacement();
  assert.ok(placement.house, 'Should show house');
  assert.ok(placement.sign, 'Should show sign');
});

Then('I should see aspects to the Moon', async function() {
  const aspects = await this.page.getRulerAspects();
  assert.ok(aspects && aspects.length > 0, 'Should show aspects to ruler');
});

Then('I should see how the ruler influences the year', async function() {
  const influence = await this.page.getRulerInfluence();
  assert.ok(influence, 'Should show ruler influence');
});

// Planetary Strength in Solar Return

When('I click {string} tab', async function(tabName) {
  await this.page.clickTab(tabName);
});

Then('I should see which planets are strongest', async function() {
  const strengths = await this.page.getPlanetaryStrengths();
  assert.ok(strengths && strengths.length > 0, 'Should show planetary strengths');
});

Then('I should see essential dignity scores', async function() {
  const scores = await this.page.getEssentialDignityScores();
  assert.ok(scores, 'Should show essential dignity scores');
});

Then('I should see:', async function(dataTable) {
  const strengths = await this.page.getPlanetaryStrengths();
  dataTable.hashes().forEach(expected => {
    const actual = strengths.find(s => s.planet === expected.Planet);
    assert.ok(actual, `Should have data for ${expected.Planet}`);
    assert.strictEqual(actual.score, parseInt(expected['Strength Score']), 'Score should match');
    assert.strictEqual(actual.status, expected.Status, 'Status should match');
  });
});

Then('I should see how to work with each planet', async function() {
  const strengths = await this.page.getPlanetaryStrengths();
  strengths.forEach(strength => {
    assert.ok(strength.guidance, 'Each planet should have guidance');
  });
});

// Solar Return Journal

When('I click {string}', async function(action) {
  await this.page.clickAction(action);
});

When('I set intentions for the year', async function() {
  await this.page.fillField('intentions', 'My intentions for this year...');
  this.journalData = { intentions: 'My intentions for this year...' };
});

When('I enter goals for each life area', async function() {
  await this.page.fillField('goals', 'Career: promotion, Health: exercise daily...');
  this.journalData.goals = 'Career: promotion, Health: exercise daily...';
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('the journal should be created', async function() {
  const journal = await this.journalService.get(this.solarReturn.id);
  assert.ok(journal, 'Journal should be created');
});

Then('I should be able to track progress', async function() {
  const journal = await this.journalService.get(this.solarReturn.id);
  assert.ok(journal.canTrack, 'Should be able to track progress');
});

Then('I should be able to review at year end', async function() {
  const journal = await this.journalService.get(this.solarReturn.id);
  assert.ok(journal.canReview, 'Should be able to review at year end');
});

// Solar Return Timing Techniques

Then('I should see planetary periods for the year', async function() {
  const periods = await this.page.getPlanetaryPeriods();
  assert.ok(periods && periods.length > 0, 'Should show planetary periods');
});

Then('I should see:', async function(dataTable) {
  const periods = await this.page.getPlanetaryPeriods();
  dataTable.hashes().forEach(expected => {
    const actual = periods.find(p => p.period === expected.Period);
    assert.ok(actual, `Should have ${expected.Period}`);
    assert.strictEqual(actual.planet, expected.Planet, 'Planet should match');
    assert.ok(actual.dates.includes(expected.Dates), 'Dates should match');
    assert.ok(actual.focus.includes(expected.Focus), 'Focus should match');
  });
});

Then('I should see monthly profections', async function() {
  const profections = await this.page.getMonthlyProfections();
  assert.ok(profections && profections.length === 12, 'Should show monthly profections');
});

Then('I should see solar return directions', async function() {
  const directions = await this.page.getSolarReturnDirections();
  assert.ok(directions, 'Should show solar return directions');
});

// Best and Worst Days

Then('I should see highlighted favorable days', async function() {
  const days = await this.page.getFavorableDays();
  assert.ok(days && days.length > 0, 'Should show favorable days');
});

Then('I should see highlighted challenging days', async function() {
  const days = await this.page.getChallengingDays();
  assert.ok(days && days.length > 0, 'Should show challenging days');
});

Then('I should see:', async function(dataTable) {
  const days = await this.page.getHighlightedDays();
  dataTable.hashes().forEach(expected => {
    const actual = days.find(d => d.date === expected.Date);
    assert.ok(actual, `Should have data for ${expected.Date}`);
    assert.strictEqual(actual.type, expected.Type, 'Type should match');
    assert.ok(actual.reason.includes(expected.Reason), 'Reason should match');
  });
});

Then('I should see recommendations for each day', async function() {
  const days = await this.page.getHighlightedDays();
  days.forEach(day => {
    assert.ok(day.recommendations, 'Each day should have recommendations');
  });
});

// Compare with Past Solar Return

Given('I have solar returns for {int} and {int}', async function(year1, year2) {
  this.solarReturns = {
    [year1]: await this.solarReturnService.calculate(year1),
    [year2]: await this.solarReturnService.calculate(year2)
  };
});

When('I click {string}', async function(action) {
  await this.page.clickAction(action);
});

Then('I should see a side-by-side comparison', async function() {
  const comparison = await this.page.getComparison();
  assert.ok(comparison.year1 && comparison.year2, 'Should show both years');
});

Then('I should see what changed', async function() {
  const changes = await this.page.getChanges();
  assert.ok(changes && changes.length > 0, 'Should show changes');
});

Then('I should see:', async function(dataTable) {
  const comparison = await this.page.getComparison();
  dataTable.hashes().forEach(expected => {
    const actual = comparison[expected.Element];
    assert.ok(actual.year1.includes(expected['2025']) || actual.year1 === expected['2025'], `${expected.Element} 2025 should match`);
    assert.ok(actual.year2.includes(expected['2026']) || actual.year2 === expected['2026'], `${expected.Element} 2026 should match`);
  });
});

Then('I should see the progression of themes', async function() {
  const progression = await this.page.getThemeProgression();
  assert.ok(progression, 'Should show theme progression');
});
