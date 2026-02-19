const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Natal Chart Creation Steps

Given('the natal chart service is available', async function() {
  this.natalChartService = await this.getService('natalChart');
  assert.ok(this.natalChartService, 'Natal chart service should be available');
});

Given('I am on the {string} page', async function(pageName) {
  this.page = await this.browser.navigateTo(`/${pageName.toLowerCase().replace(/ /g, '-')}`);
  this.currentPage = pageName;
});

When('I enter my birth date {string}', async function(date) {
  await this.page.fillField('birthDate', date);
  this.chartData.birthDate = date;
});

When('I enter my birth time {string}', async function(time) {
  await this.page.fillField('birthTime', time);
  this.chartData.birthTime = time;
});

When('I select my birth place {string}', async function(place) {
  await this.page.fillField('birthPlace', place);
  this.chartData.birthPlace = place;
});

When('With coordinates:', async function(dataTable) {
  const coordinates = {};
  dataTable.rows().forEach(row => {
    coordinates[row[0]] = parseFloat(row[1]);
  });
  await this.page.fillField('coordinates', JSON.stringify(coordinates));
  this.chartData.coordinates = coordinates;
});

When('I enter my name {string}', async function(name) {
  await this.page.fillField('name', name);
  this.chartData.name = name;
});

When('I click the {string} button', async function(buttonText) {
  this.lastAction = await this.page.clickButton(buttonText);
});

When('I select {string} option', async function(option) {
  await this.page.selectOption(option);
  this.chartData[option] = true;
});

Then('my natal chart should be created successfully', async function() {
  const chart = await this.natalChartService.findByName(this.chartData.name);
  assert.ok(chart, 'Chart should be created');
  this.createdChart = chart;
});

Then('I should see my chart visualization', async function() {
  const visualization = await this.page.getChartVisualization();
  assert.ok(visualization, 'Chart visualization should be visible');
});

Then('I should see the planetary positions', async function() {
  const positions = await this.page.getPlanetaryPositions();
  assert.ok(positions && positions.length > 0, 'Planetary positions should be displayed');
});

Then('I should see my ascendant sign', async function() {
  const ascendant = await this.page.getAscendant();
  assert.ok(ascendant, 'Ascendant should be displayed');
});

Then('I should see my sun, moon, and rising signs', async function() {
  const sunSign = await this.page.getSunSign();
  const moonSign = await this.page.getMoonSign();
  const risingSign = await this.page.getRisingSign();

  assert.ok(sunSign, 'Sun sign should be displayed');
  assert.ok(moonSign, 'Moon sign should be displayed');
  assert.ok(risingSign, 'Rising sign should be displayed');
});

Then('the chart should be saved to my profile', async function() {
  const userCharts = await this.natalChartService.getUserCharts(this.currentUser.id);
  assert.ok(userCharts.some(c => c.name === this.chartData.name), 'Chart should be in user profile');
});

Then('my natal chart should be created with a noon time default', async function() {
  const chart = await this.natalChartService.findByName(this.chartData.name);
  assert.strictEqual(chart.birthTime, '12:00', 'Default time should be noon');
});

Then('I should see a warning {string}', async function(message) {
  const warning = await this.page.getWarningMessage();
  assert.ok(warning.includes(message), 'Should see warning message');
});

Then('I should not see house cusps', async function() {
  const houseCusps = await this.page.getHouseCusps();
  assert.ok(!houseCusps || houseCusps.length === 0, 'House cusps should not be displayed');
});

Then('I should see validation errors', async function() {
  const errors = await this.page.getValidationErrors();
  assert.ok(errors && errors.length > 0, 'Validation errors should be displayed');
});

Then('I should see the message {string}', async function(message) {
  const errorMessage = await this.page.getErrorMessage();
  assert.ok(errorMessage.includes(message), 'Should see error message');
});

Then('the chart should not be created', async function() {
  const chart = await this.natalChartService.findByName(this.chartData.name);
  assert.ok(!chart, 'Chart should not be created');
});

// Viewing Chart Details

Given('I have a natal chart named {string}', async function(chartName) {
  this.currentChart = await this.natalChartService.createChart({
    name: chartName,
    userId: this.currentUser.id,
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: 'New York, USA',
    coordinates: { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' }
  });
});

Given('I am on the dashboard', async function() {
  this.page = await this.browser.navigateTo('/dashboard');
  this.currentPage = 'dashboard';
});

When('I click on {string}', async function(itemName) {
  await this.page.clickItem(itemName);
});

Then('I should see the following planetary positions:', async function(dataTable) {
  const positions = await this.page.getPlanetaryPositions();
  dataTable.hashes().forEach(expectedPosition => {
    const actual = positions.find(p => p.planet === expectedPosition.Planet);
    assert.ok(actual, `Position for ${expectedPosition.Planet} should exist`);
    assert.strictEqual(actual.sign, expectedPosition.Sign, `Sign should match for ${expectedPosition.Planet}`);
    assert.ok(Math.abs(actual.degree - parseFloat(expectedPosition.Degree)) < 0.01, 'Degree should match');
  });
});

Then('I should see aspects between planets', async function() {
  const aspects = await this.page.getAspects();
  assert.ok(aspects && aspects.length > 0, 'Aspects should be displayed');
});

Then('I should see house cusps', async function() {
  const houseCusps = await this.page.getHouseCusps();
  assert.ok(houseCusps && houseCusps.length === 12, 'House cusps should be displayed');
});

Then('I should see element distribution:', async function(dataTable) {
  const elements = await this.page.getElementDistribution();
  dataTable.hashes().forEach(expected => {
    assert.strictEqual(elements[expected.Element], parseInt(expected.Count), `${expected.Element} count should match`);
  });
});

// Editing Chart

Given('I have a natal chart with birth date {string}', async function(date) {
  this.currentChart = await this.natalChartService.createChart({
    name: 'Test Chart',
    userId: this.currentUser.id,
    birthDate: date,
    birthTime: '14:30',
    birthPlace: 'New York, USA'
  });
});

Given('I am viewing the chart details', async function() {
  this.page = await this.browser.navigateTo(`/charts/${this.currentChart.id}`);
  this.currentPage = 'chartDetails';
});

When('I click the {string} button', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

When('I change the birth date to {string}', async function(newDate) {
  await this.page.fillField('birthDate', newDate);
  this.updatedData = { birthDate: newDate };
});

When('I click the {string} button', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('the chart should be recalculated', async function() {
  const updatedChart = await this.natalChartService.findById(this.currentChart.id);
  assert.notDeepStrictEqual(updatedChart.planetaryPositions, this.currentChart.planetaryPositions, 'Chart should be recalculated');
});

Then('I should see updated planetary positions', async function() {
  const positions = await this.page.getPlanetaryPositions();
  assert.ok(positions, 'Updated positions should be displayed');
});

Then('I should see a success message {string}', async function(message) {
  const successMessage = await this.page.getSuccessMessage();
  assert.ok(successMessage.includes(message), 'Should see success message');
});

Given('I have a natal chart with birth time {string}', async function(time) {
  this.currentChart = await this.natalChartService.createChart({
    name: 'Test Chart',
    userId: this.currentUser.id,
    birthDate: '1990-05-15',
    birthTime: time,
    birthPlace: 'New York, USA'
  });
});

Given('the original chart shows Aries ascendant', async function() {
  const chart = await this.natalChartService.findById(this.currentChart.id);
  assert.strictEqual(chart.ascendant.sign, 'Aries', 'Original chart should have Aries ascendant');
});

When('I change the birth time to {string}', async function(newTime) {
  await this.page.fillField('birthTime', newTime);
});

Then('the ascendant should be recalculated', async function() {
  const updatedChart = await this.natalChartService.findById(this.currentChart.id);
  assert.notStrictEqual(updatedChart.ascendant, this.currentChart.ascendant, 'Ascendant should change');
});

Then('the house cusps should be updated', async function() {
  const updatedChart = await this.natalChartService.findById(this.currentChart.id);
  assert.notDeepStrictEqual(updatedChart.houseCusps, this.currentChart.houseCusps, 'House cusps should update');
});

Then('I should see the new ascendant sign', async function() {
  const ascendant = await this.page.getAscendant();
  assert.ok(ascendant, 'New ascendant should be displayed');
});

// Delete Chart

Given('I am on my charts list', async function() {
  this.page = await this.browser.navigateTo('/charts');
  this.currentPage = 'chartsList';
});

When('I click the delete button for {string}', async function(chartName) {
  await this.page.clickDeleteButton(chartName);
  this.chartToDelete = chartName;
});

When('I confirm the deletion', async function() {
  await this.page.confirmDeletion();
});

Then('{string} should be removed from my list', async function(chartName) {
  const charts = await this.page.getChartsList();
  assert.ok(!charts.includes(chartName), `${chartName} should be removed`);
});

Then('I should see a success message {string}', async function(message) {
  const successMessage = await this.page.getSuccessMessage();
  assert.ok(successMessage.includes(message), 'Should see success message');
});

Then('the chart should not be recoverable', async function() {
  const chart = await this.natalChartService.findByName(this.chartToDelete);
  assert.ok(!chart, 'Chart should be permanently deleted');
});

// Search and Filter

Given('I have multiple natal charts:', async function(dataTable) {
  this.testCharts = [];
  for (const row of dataTable.hashes()) {
    const chart = await this.natalChartService.createChart({
      name: row.Name,
      userId: this.currentUser.id,
      birthDate: row['Birth Date'],
      birthTime: '12:00',
      birthPlace: 'New York, USA'
    });
    this.testCharts.push(chart);
  }
});

Given('I am on the charts list page', async function() {
  this.page = await this.browser.navigateTo('/charts');
});

When('I search for {string}', async function(searchTerm) {
  await this.page.fillField('search', searchTerm);
  this.searchResults = await this.page.getSearchResults();
});

Then('I should see only {string} in the results', async function(expectedResult) {
  assert.ok(this.searchResults.length === 1, 'Should have exactly one result');
  assert.strictEqual(this.searchResults[0], expectedResult, 'Result should match search');
});

When('I filter by birth year {string}', async function(year) {
  await this.page.selectFilter('birthYear', year);
  this.filteredResults = await this.page.getFilteredResults();
});

Then('I should see only charts from {int}', async function(year) {
  this.filteredResults.forEach(chart => {
    assert.ok(chart.birthDate.startsWith(year.toString()), 'All charts should be from the specified year');
  });
});

// Export Chart

When('I click the {string} button', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

When('I select {string} format', async function(format) {
  await this.page.selectOption(format);
  this.exportFormat = format;
});

Then('a {string} file should be downloaded', async function(fileType) {
  const downloadedFile = await this.browser.getDownloadedFile();
  assert.ok(downloadedFile.name.endsWith(fileType.toLowerCase()), `File should be ${fileType}`);
});

Then('the PDF should contain the chart visualization', async function() {
  const pdfContent = await this.browser.getPDFContent();
  assert.ok(pdfContent.includes('chart') || pdfContent.includes('visualization'), 'PDF should contain chart');
});

Then('the PDF should contain all planetary positions', async function() {
  const pdfContent = await this.browser.getPDFContent();
  const positions = await this.page.getPlanetaryPositions();
  positions.forEach(pos => {
    assert.ok(pdfContent.includes(pos.planet), `PDF should include ${pos.planet}`);
  });
});

Then('the PDF should contain aspect details', async function() {
  const pdfContent = await this.browser.getPDFContent();
  assert.ok(pdfContent.includes('aspect') || pdfContent.includes('Aspect'), 'PDF should contain aspects');
});

// Chart with Various Locations

When('I select my birth place {string}', async function(location) {
  await this.page.fillField('birthPlace', location);
  this.chartData.birthPlace = location;
});

Then('the chart should be created with timezone {string}', async function(timezone) {
  const chart = await this.natalChartService.findByName(this.chartData.name);
  assert.strictEqual(chart.coordinates.timezone, timezone, 'Timezone should match');
});

Then('the coordinates should be:', async function(dataTable) {
  const chart = await this.natalChartService.findByName(this.chartData.name);
  dataTable.hashes().forEach(row => {
    const expected = parseFloat(row.Value);
    const actual = chart.coordinates[row.latitude || row.longitude];
    assert.ok(Math.abs(actual - expected) < 0.0001, `${row.latitude || row.longitude} should match`);
  });
});

// Chart Interpretation

When('I click the {string} tab', async function(tabName) {
  await this.page.clickTab(tabName);
});

Then('I should see a detailed personality reading', async function() {
  const reading = await this.page.getPersonalityReading();
  assert.ok(reading && reading.length > 0, 'Personality reading should be displayed');
});

Then('I should see insights about my sun sign', async function() {
  const sunInsights = await this.page.getSunSignInsights();
  assert.ok(sunInsights, 'Sun sign insights should be displayed');
});

Then('I should see insights about my moon sign', async function() {
  const moonInsights = await this.page.getMoonSignInsights();
  assert.ok(moonInsights, 'Moon sign insights should be displayed');
});

Then('I should see insights about my rising sign', async function() {
  const risingInsights = await this.page.getRisingSignInsights();
  assert.ok(risingInsights, 'Rising sign insights should be displayed');
});

Then('I should see dominant elements', async function() {
  const elements = await this.page.getDominantElements();
  assert.ok(elements && elements.length > 0, 'Dominant elements should be displayed');
});

Then('I should see strengths and challenges', async function() {
  const strengths = await this.page.getStrengths();
  const challenges = await this.page.getChallenges();
  assert.ok(strengths && strengths.length > 0, 'Strengths should be displayed');
  assert.ok(challenges && challenges.length > 0, 'Challenges should be displayed');
});
