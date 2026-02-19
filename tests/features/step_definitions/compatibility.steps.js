const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Compatibility Analysis Setup

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

Given('I have another person\'s chart with:', async function(dataTable) {
  const chartData = {};
  dataTable.hashes().forEach(row => {
    chartData[row.Field] = row.Value;
  });
  this.partnerChart = await this.createNatalChart(chartData);
});

When('I select {string}', async function(action) {
  await this.page.selectAction(action);
});

When('I select {string} as the partner', async function(partnerName) {
  await this.page.selectPartner(partnerName);
  this.selectedPartner = partnerName;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('I should see a compatibility analysis', async function() {
  const analysis = await this.page.getCompatibilityAnalysis();
  assert.ok(analysis, 'Should show compatibility analysis');
});

Then('I should see an overall compatibility score', async function() {
  const score = await this.page.getOverallScore();
  assert.ok(typeof score === 'number', 'Should have overall score');
  assert.ok(score >= 0 && score <= 100, 'Score should be between 0-100');
});

Then('I should see comparisons by planet', async function() {
  const comparisons = await this.page.getPlanetComparisons();
  assert.ok(comparisons && comparisons.length > 0, 'Should show planet comparisons');
});

Then('I should see aspect analysis', async function() {
  const aspects = await this.page.getAspectAnalysis();
  assert.ok(aspects, 'Should show aspect analysis');
});

// Comprehensive Compatibility Score

Given('I have compared my chart with {string}', async function(partnerName) {
  this.compatibilityResult = await this.compatibilityService.compare(this.myChart, this.partnerChart);
});

Given('I am viewing the compatibility results', async function() {
  this.page = await this.browser.navigateTo(`/compatibility/${this.compatibilityResult.id}`);
});

Then('I should see an overall score between {int}-{int}', async function(min, max) {
  const score = await this.page.getOverallScore();
  assert.ok(score >= min && score <= max, `Score should be between ${min}-${max}`);
});

Then('I should see scores by category:', async function(dataTable) {
  const scores = await this.page.getCategoryScores();
  dataTable.hashes().forEach(expected => {
    const actual = scores.find(s => s.category === expected.Category);
    assert.ok(actual, `Should have score for ${expected.Category}`);
    assert.strictEqual(actual.score, parseInt(expected.Score), 'Score should match');
    assert.strictEqual(actual.weight, expected.Weight, 'Weight should match');
  });
});

Then('I should see the calculation methodology', async function() {
  const methodology = await this.page.getCalculationMethodology();
  assert.ok(methodology, 'Should show calculation methodology');
});

// Synastry Aspects

When('I click the {string} tab', async function(tabName) {
  await this.page.clickTab(tabName);
});

Then('I should see aspects between the two charts', async function() {
  const aspects = await this.page.getSynastryAspects();
  assert.ok(aspects && aspects.length > 0, 'Should show synastry aspects');
});

Then('I should see:', async function(dataTable) {
  const aspects = await this.page.getSynastryAspects();
  dataTable.hashes().forEach(expected => {
    const [planet1, partner1] = expected['Partner 1 Planet'].split("'s ");
    const [planet2, partner2] = expected['Partner 2 Planet'].split("'s ");
    const actual = aspects.find(a =>
      a.planet1 === planet1 &&
      a.planet2 === planet2 &&
      a.aspect === expected.Aspect
    );
    assert.ok(actual, `Should have aspect between ${planet1} and ${planet2}`);
    assert.ok(actual.meaning.includes(expected.Meaning), 'Meaning should match');
  });
});

Then('I should see the orb of each aspect', async function() {
  const aspects = await this.page.getSynastryAspects();
  aspects.forEach(aspect => {
    assert.ok(typeof aspect.orb === 'number', 'Each aspect should have an orb');
  });
});

Then('I should see positive and challenging aspects marked', async function() {
  const aspects = await this.page.getSynastryAspects();
  aspects.forEach(aspect => {
    assert.ok(aspect.type === 'positive' || aspect.type === 'challenging', 'Aspects should be marked as positive or challenging');
  });
});

// Composite Chart

Then('I should see a composite chart visualization', async function() {
  const chart = await this.page.getCompositeChart();
  assert.ok(chart, 'Should show composite chart');
});

Then('I should see the composite Sun sign', async function() {
  const sunSign = await this.page.getCompositeSunSign();
  assert.ok(sunSign, 'Should show composite Sun sign');
});

Then('I should see the composite Moon sign', async function() {
  const moonSign = await this.page.getCompositeMoonSign();
  assert.ok(moonSign, 'Should show composite Moon sign');
});

Then('I should see the composite Venus sign', async function() {
  const venusSign = await this.page.getCompositeVenusSign();
  assert.ok(venusSign, 'Should show composite Venus sign');
});

Then('I should see the composite ascendant', async function() {
  const ascendant = await this.page.getCompositeAscendant();
  assert.ok(ascendant, 'Should show composite ascendant');
});

Then('I should see the relationship\'s purpose and theme', async function() {
  const purpose = await this.page.getRelationshipPurpose();
  const theme = await this.page.getRelationshipTheme();
  assert.ok(purpose, 'Should show relationship purpose');
  assert.ok(theme, 'Should show relationship theme');
});

// Relationship Strengths

Then('I should see a {string} section', async function(sectionName) {
  const section = await this.page.getSection(sectionName);
  assert.ok(section, `Should have ${sectionName} section`);
});

Then('I should see positive aspects:', async function(dataTable) {
  const strengths = await this.page.getStrengths();
  dataTable.hashes().forEach(expected => {
    const actual = strengths.find(s => s.strength.includes(expected.Strength));
    assert.ok(actual, `Should have strength: ${expected.Strength}`);
    assert.ok(actual.description.includes(expected.Description), 'Description should match');
  });
});

Then('I should see how to leverage these strengths', async function() {
  const leverage = await this.page.getStrengthLeverage();
  assert.ok(leverage && leverage.length > 0, 'Should show how to leverage strengths');
});

// Relationship Challenges

Then('I should see challenging aspects:', async function(dataTable) {
  const challenges = await this.page.getChallenges();
  dataTable.hashes().forEach(expected => {
    const actual = challenges.find(c => c.challenge.includes(expected.Challenge));
    assert.ok(actual, `Should have challenge: ${expected.Challenge}`);
    assert.ok(actual.description.includes(expected.Description), 'Description should match');
  });
});

Then('I should see suggestions to overcome challenges', async function() {
  const suggestions = await this.page.getChallengeSuggestions();
  assert.ok(suggestions && suggestions.length > 0, 'Should show suggestions to overcome challenges');
});

// Romantic Compatibility

When('I select {string} as relationship type', async function(type) {
  await this.page.selectRelationshipType(type);
  this.relationshipType = type;
});

Then('I should see romantic-specific insights', async function() {
  const insights = await this.page.getRomanticInsights();
  assert.ok(insights && insights.length > 0, 'Should show romantic insights');
});

Then('I should see Venus sign compatibility', async function() {
  const venusCompatibility = await this.page.getVenusCompatibility();
  assert.ok(venusCompatibility, 'Should show Venus compatibility');
});

Then('I should see Mars sign compatibility', async function() {
  const marsCompatibility = await this.page.getMarsCompatibility();
  assert.ok(marsCompatibility, 'Should show Mars compatibility');
});

Then('I should see romantic potential score', async function() {
  const score = await this.page.getRomanticScore();
  assert.ok(typeof score === 'number', 'Should have romantic score');
});

Then('I should see relationship timeline predictions', async function() {
  const timeline = await this.page.getRelationshipTimeline();
  assert.ok(timeline && timeline.length > 0, 'Should show relationship timeline');
});

Then('I should see love languages based on astrology', async function() {
  const loveLanguages = await this.page.getLoveLanguages();
  assert.ok(loveLanguages && loveLanguages.length > 0, 'Should show love languages');
});

// Business Compatibility

When('I select {string} as relationship type', async function(type) {
  await this.page.selectRelationshipType(type);
  this.relationshipType = type;
});

When('I select my business partner\'s chart', async function() {
  await this.page.selectPartner(this.partnerChart.name);
});

Then('I should see business-specific insights', async function() {
  const insights = await this.page.getBusinessInsights();
  assert.ok(insights && insights.length > 0, 'Should show business insights');
});

Then('I should see career house comparisons', async function() {
  const houseComparison = await this.page.getCareerHouseComparison();
  assert.ok(houseComparison, 'Should show career house comparison');
});

Then('I should see work style compatibility', async function() {
  const workStyle = await this.page.getWorkStyleCompatibility();
  assert.ok(workStyle, 'Should show work style compatibility');
});

Then('I should see potential for business success', async function() {
  const success = await this.page.getBusinessSuccessPotential();
  assert.ok(typeof success === 'number', 'Should have business success score');
});

Then('I should see areas of cooperation and conflict', async function() {
  const areas = await this.page.getCooperationConflictAreas();
  assert.ok(areas, 'Should show cooperation and conflict areas');
});

// Friendship Compatibility

When('I select {string} as relationship type', async function(type) {
  await this.page.selectRelationshipType(type);
  this.relationshipType = type;
});

When('I select my friend\'s chart', async function() {
  await this.page.selectPartner(this.partnerChart.name);
});

Then('I should see friendship-specific insights', async function() {
  const insights = await this.page.getFriendshipInsights();
  assert.ok(insights && insights.length > 0, 'Should show friendship insights');
});

Then('I should see communication compatibility', async function() {
  const communication = await this.page.getCommunicationCompatibility();
  assert.ok(communication, 'Should show communication compatibility');
});

Then('I should see shared interests', async function() {
  const interests = await this.page.getSharedInterests();
  assert.ok(interests && interests.length > 0, 'Should show shared interests');
});

Then('I should see social style match', async function() {
  const socialStyle = await this.page.getSocialStyleMatch();
  assert.ok(socialStyle, 'Should show social style match');
});

Then('I should see long-term friendship potential', async function() {
  const potential = await this.page.getFriendshipPotential();
  assert.ok(typeof potential === 'number', 'Should have friendship potential score');
});

// Compatibility Over Time

When('I click the {string} tab', async function(tabName) {
  await this.page.clickTab(tabName);
});

Then('I should see how compatibility changes over time', async function() {
  const timeline = await this.page.getCompatibilityTimeline();
  assert.ok(timeline && timeline.length > 0, 'Should show compatibility timeline');
});

Then('I should see upcoming transits affecting the relationship', async function() {
  const transits = await this.page.getRelationshipTransits();
  assert.ok(transits && transits.length > 0, 'Should show relationship transits');
});

Then('I should see:', async function(dataTable) {
  const transits = await this.page.getRelationshipTransits();
  dataTable.hashes().forEach(expected => {
    const actual = transits.find(t => t.date === expected.Date);
    assert.ok(actual, `Should have transit on ${expected.Date}`);
    assert.ok(actual.transit.includes(expected.Transit), 'Transit should match');
    assert.ok(actual.effect.includes(expected.Effect), 'Effect should match');
  });
});

Then('I should see favorable periods for relationship growth', async function() {
  const periods = await this.page.getFavorablePeriods();
  assert.ok(periods && periods.length > 0, 'Should show favorable periods');
});

// Save Compatibility Report

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

When('I enter a name {string}', async function(reportName) {
  await this.page.fillField('reportName', reportName);
  this.reportName = reportName;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('the compatibility report should be saved', async function() {
  const report = await this.compatibilityService.getReport(this.reportName);
  assert.ok(report, 'Report should be saved');
});

Then('I should see it in my saved reports list', async function() {
  const reports = await this.page.getSavedReports();
  assert.ok(reports.some(r => r.name === this.reportName), 'Report should be in saved list');
});

Then('I should be able to access it later', async function() {
  const report = await this.compatibilityService.getReport(this.reportName);
  assert.ok(report, 'Should be able to access report later');
});

// Export Compatibility Analysis

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

When('I select {string} format', async function(format) {
  await this.page.selectOption(format);
  this.exportFormat = format;
});

When('I select to include charts', async function() {
  await this.page.checkOption('includeCharts');
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('a PDF should be downloaded', async function() {
  const downloadedFile = await this.browser.getDownloadedFile();
  assert.ok(downloadedFile.name.endsWith('.pdf'), 'Should download PDF');
});

Then('the PDF should contain both charts', async function() {
  const pdfContent = await this.browser.getPDFContent();
  assert.ok(pdfContent.includes('chart'), 'PDF should contain charts');
});

Then('the PDF should contain compatibility scores', async function() {
  const pdfContent = await this.browser.getPDFContent();
  assert.ok(pdfContent.includes('score') || pdfContent.includes('compatibility'), 'PDF should contain scores');
});

Then('the PDF should contain aspect interpretations', async function() {
  const pdfContent = await this.browser.getPDFContent();
  assert.ok(pdfContent.includes('aspect'), 'PDF should contain aspect interpretations');
});

// Compatibility Scores by Sign Combinations

Given('I am comparing two charts', async function() {
  this.comparison = await this.compatibilityService.compare(this.myChart, this.partnerChart);
});

Given('Partner 1 has Sun in {string}', async function(sign) {
  this.myChart.sunSign = sign;
});

Given('Partner 2 has Sun in {string}', async function(sign) {
  this.partnerChart.sunSign = sign;
});

When('the compatibility is calculated', async function() {
  this.result = await this.compatibilityService.calculateSunSignScore(
    this.myChart.sunSign,
    this.partnerChart.sunSign
  );
});

Then('the Sun sign score should be {int}', async function(score) {
  assert.strictEqual(this.result.score, score, 'Sun sign score should match');
});

Then('the compatibility type should be {string}', async function(type) {
  assert.strictEqual(this.result.type, type, 'Compatibility type should match');
});

// Compare Multiple Potential Partners

Given('I have charts for multiple potential partners', async function() {
  this.partners = await this.createMultipleCharts(5);
});

When('I select {string}', async function(action) {
  await this.page.selectAction(action);
});

When('I select {int} partners to compare', async function(count) {
  await this.page.selectPartners(this.partners.slice(0, count));
  this.selectedPartners = count;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('I should see a comparison table', async function() {
  const table = await this.page.getComparisonTable();
  assert.ok(table, 'Should show comparison table');
});

Then('I should see:', async function(dataTable) {
  const table = await this.page.getComparisonTable();
  dataTable.hashes().forEach(expected => {
    const row = table.find(r => r.partner === expected.Partner);
    assert.ok(row, `Should have row for ${expected.Partner}`);
    assert.strictEqual(row.overall, parseInt(expected['Overall Score']), 'Overall score should match');
    assert.strictEqual(row.romantic, parseInt(expected.Romantic), 'Romantic score should match');
    assert.strictEqual(row.business, parseInt(expected.Business), 'Business score should match');
    assert.strictEqual(row.friendship, parseInt(expected.Friendship), 'Friendship score should match');
  });
});

Then('I should see rankings by category', async function() {
  const rankings = await this.page.getCategoryRankings();
  assert.ok(rankings, 'Should show rankings by category');
});

// Asteroid and Minor Planet Compatibility

When('I click {string} tab', async function(tabName) {
  await this.page.clickTab(tabName);
});

Then('I should see Chiron aspects', async function() {
  const chiron = await this.page.getChironAspects();
  assert.ok(chiron, 'Should show Chiron aspects');
});

Then('I should see Juno aspects', async function() {
  const juno = await this.page.getJunoAspects();
  assert.ok(juno, 'Should show Juno aspects (marriage asteroid)');
});

Then('I should see Vesta aspects', async function() {
  const vesta = await this.page.getVestaAspects();
  assert.ok(vesta, 'Should show Vesta aspects');
});

Then('I should see Ceres aspects', async function() {
  const ceres = await this.page.getCeresAspects();
  assert.ok(ceres, 'Should show Ceres aspects');
});

Then('I should see interpretations for each', async function() {
  const asteroids = ['Chiron', 'Juno', 'Vesta', 'Ceres'];
  for (const asteroid of asteroids) {
    const aspects = await this.page[`${asteroid.toLowerCase()}Aspects`]();
    aspects.forEach(aspect => {
      assert.ok(aspect.interpretation, `${asteroid} aspect should have interpretation`);
    });
  }
});

// Karmic Connections

Then('I should see North Node connections', async function() {
  const northNode = await this.page.getNorthNodeConnections();
  assert.ok(northNode, 'Should show North Node connections');
});

Then('I should see Saturn aspects', async function() {
  const saturn = await this.page.getSaturnAspects();
  assert.ok(saturn, 'Should show Saturn aspects');
});

Then('I should see past life indicators', async function() {
  const pastLife = await this.page.getPastLifeIndicators();
  assert.ok(pastLife, 'Should show past life indicators');
});

Then('I should see karmic debt', async function() {
  const debt = await this.page.getKarmicDebt();
  assert.ok(debt !== undefined, 'Should show karmic debt');
});

Then('I should see soul connection assessment', async function() {
  const connection = await this.page.getSoulConnection();
  assert.ok(connection, 'Should show soul connection assessment');
});

// Compatibility Recommendations

Then('I should see personalized advice', async function() {
  const advice = await this.page.getPersonalizedAdvice();
  assert.ok(advice && advice.length > 0, 'Should show personalized advice');
});

Then('I should see activities to strengthen the relationship', async function() {
  const activities = await this.page.getStrengtheningActivities();
  assert.ok(activities && activities.length > 0, 'Should show strengthening activities');
});

Then('I should see communication tips', async function() {
  const tips = await this.page.getCommunicationTips();
  assert.ok(tips && tips.length > 0, 'Should show communication tips');
});

Then('I should see timing advice for important decisions', async function() {
  const timing = await this.page.getTimingAdvice();
  assert.ok(timing, 'Should show timing advice');
});

Then('I should see growth opportunities for both partners', async function() {
  const opportunities = await this.page.getGrowthOpportunities();
  assert.ok(opportunities && opportunities.length > 0, 'Should show growth opportunities');
});
