const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Calendar Setup

Given('the calendar service is available', async function() {
  this.calendarService = await this.getService('calendar');
  assert.ok(this.calendarService, 'Calendar service should be available');
});

Given('ephemeris data is loaded', async function() {
  const isLoaded = await this.calendarService.isEphemerisLoaded();
  assert.ok(isLoaded, 'Ephemeris data should be loaded');
});

Given('I am on the calendar page', async function() {
  this.page = await this.browser.navigateTo('/calendar');
  this.currentPage = 'calendar';
});

Given('I am viewing the month of {string}', async function(monthYear) {
  await this.page.selectMonth(monthYear);
  this.currentView = { type: 'month', value: monthYear };
});

Then('I should see a calendar grid for the month', async function() {
  const calendarGrid = await this.page.getCalendarGrid();
  assert.ok(calendarGrid, 'Calendar grid should be visible');
  assert.ok(calendarGrid.days.length > 0, 'Calendar should have days');
});

Then('I should see the following astrological events:', async function(dataTable) {
  const events = await this.page.getEvents();
  dataTable.hashes().forEach(expectedEvent => {
    const actualEvent = events.find(e =>
      e.date === expectedEvent.Date &&
      e.type === expectedEvent['Event Type'] &&
      e.description.includes(expectedEvent.Description)
    );
    assert.ok(actualEvent, `Event ${expectedEvent.Description} on ${expectedEvent.Date} should exist`);
  });
});

Then('the events should be color-coded by type', async function() {
  const events = await this.page.getEvents();
  events.forEach(event => {
    assert.ok(event.color, `Event ${event.type} should have a color`);
  });
});

// Daily Events

When('I click on the day {string}', async function(date) {
  await this.page.clickDate(date);
  this.selectedDate = date;
});

Then('I should see detailed events for that day', async function() {
  const events = await this.page.getEventsForDate(this.selectedDate);
  assert.ok(events && events.length > 0, 'Should have events for selected date');
});

Then('I should see the New Moon at {string}', async function(time) {
  const events = await this.page.getEventsForDate(this.selectedDate);
  const newMoon = events.find(e => e.type === 'New Moon');
  assert.ok(newMoon, 'Should have New Moon event');
  assert.ok(newMoon.time.includes(time), `New Moon should be at ${time}`);
});

Then('I should see affected zodiac signs', async function() {
  const affectedSigns = await this.page.getAffectedSigns();
  assert.ok(affectedSigns && affectedSigns.length > 0, 'Should show affected zodiac signs');
});

Then('I should see recommended activities', async function() {
  const activities = await this.page.getRecommendedActivities();
  assert.ok(activities && activities.length > 0, 'Should show recommended activities');
});

Then('I should see aspects for that day', async function() {
  const aspects = await this.page.getAspectsForDate(this.selectedDate);
  assert.ok(aspects && aspects.length > 0, 'Should show aspects for the day');
});

// Reminders

Given('I am viewing the event {string} on {string}', async function(eventName, date) {
  await this.page.selectEvent(eventName, date);
  this.currentEvent = { name: eventName, date };
});

When('I click the {string} button', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

When('I select {string} as reminder time', async function(time) {
  await this.page.selectReminderTime(time);
  this.reminderTime = time;
});

When('I select {string} as reminder method', async function(method) {
  await this.page.selectReminderMethod(method);
  this.reminderMethod = method;
});

When('I click {string}', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('a reminder should be scheduled', async function() {
  const reminder = await this.calendarService.getReminder(this.currentEvent.name, this.currentEvent.date);
  assert.ok(reminder, 'Reminder should be scheduled');
  this.createdReminder = reminder;
});

Then('I should see a confirmation {string}', async function(message) {
  const confirmation = await this.page.getConfirmationMessage();
  assert.ok(confirmation.includes(message), 'Should see confirmation message');
});

Then('I should receive a reminder on {string}', async function(date) {
  assert.ok(this.createdReminder.reminderDate.includes(date), 'Reminder should be set for correct date');
});

Given('I have a reminder set for {string} {string} before', async function(eventName, time) {
  this.createdReminder = await this.calendarService.createReminder({
    eventName,
    reminderTime: time,
    method: 'email'
  });
});

Given('I am viewing my reminders', async function() {
  this.page = await this.browser.navigateTo('/reminders');
  this.currentPage = 'reminders';
});

Then('I should have {int} active reminders', async function(count) {
  const reminders = await this.calendarService.getActiveReminders();
  assert.strictEqual(reminders.length, count, `Should have ${count} active reminders`);
});

Then('I should see all reminders in my reminder list', async function() {
  const displayedReminders = await this.page.getReminderList();
  const activeReminders = await this.calendarService.getActiveReminders();
  assert.strictEqual(displayedReminders.length, activeReminders.length, 'All reminders should be displayed');
});

Then('each reminder should show the event date and reminder time', async function() {
  const reminders = await this.page.getReminderList();
  reminders.forEach(reminder => {
    assert.ok(reminder.eventDate, 'Reminder should show event date');
    assert.ok(reminder.reminderTime, 'Reminder should show reminder time');
  });
});

When('I click the {string} button for the reminder', async function(buttonText) {
  await this.page.clickReminderButton(this.createdReminder.id, buttonText);
});

When('I change the reminder time to {string}', async function(newTime) {
  await this.page.updateReminderTime(newTime);
  this.updatedReminderTime = newTime;
});

When('I add {string} as an additional reminder method', async function(method) {
  await this.page.addReminderMethod(method);
  this.additionalMethod = method;
});

Then('the reminder should be updated', async function() {
  const reminder = await this.calendarService.getReminderById(this.createdReminder.id);
  assert.strictEqual(reminder.reminderTime, this.updatedReminderTime, 'Reminder time should be updated');
});

Then('I should receive reminders via both email and SMS', async function() {
  const reminder = await this.calendarService.getReminderById(this.createdReminder.id);
  assert.ok(reminder.methods.includes('email'), 'Should receive email reminder');
  assert.ok(reminder.methods.includes('sms'), 'Should receive SMS reminder');
});

When('I click the {string} button for the reminder', async function(buttonText) {
  await this.page.clickReminderButton(this.createdReminder.id, buttonText);
});

When('I confirm the deletion', async function() {
  await this.page.confirmDeletion();
});

Then('the reminder should be removed', async function() {
  const reminder = await this.calendarService.getReminderById(this.createdReminder.id);
  assert.ok(!reminder, 'Reminder should be removed');
});

Then('I should not receive any notification for the event', async function() {
  const notifications = await this.notificationService.getNotificationsForEvent(this.createdReminder.eventName);
  assert.strictEqual(notifications.length, 0, 'Should not receive notifications');
});

// Personal Transits

Given('I have a natal chart with Sun at {string}', async function(position) {
  this.natalChart = await this.createNatalChart({ sunPosition: position });
});

Given('I am on the calendar page for {string}', async function(monthYear) {
  await this.browser.navigateTo('/calendar');
  await this.page.selectMonth(monthYear);
  this.currentView = { type: 'month', value: monthYear };
});

Then('I should see my personal transits marked', async function() {
  const transits = await this.page.getPersonalTransits();
  assert.ok(transits && transits.length > 0, 'Should see personal transits');
});

Then('I should see when Mercury conjuncts my Sun', async function() {
  const transits = await this.page.getPersonalTransits();
  const mercurySunConjunction = transits.find(t =>
    t.planet1 === 'Mercury' && t.planet2 === 'Sun' && t.aspect === 'conjunction'
  );
  assert.ok(mercurySunConjunction, 'Should show Mercury conjunct Sun transit');
});

Then('I should see when Venus opposes my Sun', async function() {
  const transits = await this.page.getPersonalTransits();
  const venusSunOpposition = transits.find(t =>
    t.planet1 === 'Venus' && t.planet2 === 'Sun' && t.aspect === 'opposition'
  );
  assert.ok(venusSunOpposition, 'Should show Venus oppose Sun transit');
});

Then('I should see when Mars squares my Sun', async function() {
  const transits = await this.page.getPersonalTransits();
  const marsSunSquare = transits.find(t =>
    t.planet1 === 'Mars' && t.planet2 === 'Sun' && t.aspect === 'square'
  );
  assert.ok(marsSunSquare, 'Should show Mars square Sun transit');
});

Then('the events should be labeled {string}', async function(label) {
  const transits = await this.page.getPersonalTransits();
  transits.forEach(transit => {
    assert.ok(transit.label === label, `Transit should be labeled ${label}`);
  });
});

// Filtering Events

Given('the calendar shows multiple event types', async function() {
  const events = await this.page.getAllEvents();
  assert.ok(events.length > 0, 'Calendar should have events');
  this.allEvents = events;
});

When('I select {string} filter', async function(filterName) {
  await this.page.applyFilter(filterName);
  this.currentFilter = filterName;
});

Then('I should see only New Moons and Full Moons', async function() {
  const events = await this.page.getVisibleEvents();
  events.forEach(event => {
    assert.ok(
      event.type === 'New Moon' || event.type === 'Full Moon',
      'Should only show lunar events'
    );
  });
});

Then('I should see only sign changes and ingresses', async function() {
  const events = await this.page.getVisibleEvents();
  events.forEach(event => {
    assert.ok(
      event.type === 'ingress' || event.type === 'sign change',
      'Should only show planetary movements'
    );
  });
});

Then('I should see only retrograde stations', async function() {
  const events = await this.page.getVisibleEvents();
  events.forEach(event => {
    assert.ok(
      event.type === 'retrograde' || event.type === 'direct',
      'Should only show retrograde periods'
    );
  });
});

// Navigation

Given('I am viewing the calendar for {string}', async function(monthYear) {
  await this.page.selectMonth(monthYear);
  this.currentView = { type: 'month', value: monthYear };
});

When('I click the {string} button', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('I should see the calendar for {string}', async function(monthYear) {
  const currentView = await this.page.getCurrentView();
  assert.ok(currentView.includes(monthYear), `Should view ${monthYear}`);
});

Then('the events should be updated for {string}', async function(month) {
  const events = await this.page.getEvents();
  events.forEach(event => {
    assert.ok(event.date.includes(month), 'Events should be for the correct month');
  });
});

Then('I should see a {string} button', async function(buttonText) {
  const button = await this.page.getButton(buttonText);
  assert.ok(button, `${buttonText} button should exist`);
});

When('I click the {string} button', async function(buttonText) {
  await this.page.clickButton(buttonText);
});

Then('I should see the calendar for the current month', async function() {
  const currentView = await this.page.getCurrentView();
  const currentMonth = new Date().toLocaleString('en-us', { month: 'long', year: 'numeric' });
  assert.ok(currentView.includes(currentMonth), 'Should view current month');
});

// Export Calendar

Given('I have selected events to export:', async function(dataTable) {
  this.eventsToExport = dataTable.hashes().map(row => row.Event);
  await this.page.selectEvents(this.eventsToExport);
});

Then('an .ics file should be downloaded', async function() {
  const downloadedFile = await this.browser.getDownloadedFile();
  assert.ok(downloadedFile.name.endsWith('.ics'), 'Should download .ics file');
});

Then('the file should contain the selected events', async function() {
  const fileContent = await this.browser.getDownloadedFileContent();
  this.eventsToExport.forEach(event => {
    assert.ok(fileContent.includes(event), `File should contain ${event}`);
  });
});

Then('the file should be compatible with calendar applications', async function() {
  const fileContent = await this.browser.getDownloadedFileContent();
  assert.ok(fileContent.includes('BEGIN:VCALENDAR'), 'Should be valid iCal format');
  assert.ok(fileContent.includes('BEGIN:VEVENT'), 'Should contain events');
});

When('I select {string}', async function(option) {
  await this.page.selectOption(option);
});

Then('I should be redirected to Google Calendar', async function() {
  const currentUrl = await this.browser.getCurrentUrl();
  assert.ok(currentUrl.includes('calendar.google.com'), 'Should redirect to Google Calendar');
});

Then('the events should be pre-populated', async function() {
  const calendarEvents = await this.page.getGoogleCalendarEvents();
  assert.ok(calendarEvents.length >= this.eventsToExport.length, 'Events should be pre-populated');
});

// Search Events

Given('I am viewing the year {int}', async function(year) {
  await this.page.selectYear(year);
  this.currentView = { type: 'year', value: year };
});

When('I search for {string}', async function(searchTerm) {
  await this.page.fillField('search', searchTerm);
  this.searchResults = await this.page.getSearchResults();
});

Then('I should see all Full Moons in {int}', async function(year) {
  assert.ok(this.searchResults.length > 0, 'Should have Full Moon results');
  this.searchResults.forEach(result => {
    assert.ok(result.date.includes(year.toString()), `Result should be in ${year}`);
    assert.ok(result.type === 'Full Moon', 'Result should be Full Moon');
  });
});

Then('I should see their dates and zodiac signs', async function() {
  this.searchResults.forEach(result => {
    assert.ok(result.date, 'Result should have date');
    assert.ok(result.zodiacSign, 'Result should have zodiac sign');
  });
});

Then('the results should be:', async function(dataTable) {
  dataTable.hashes().forEach(expected => {
    const actual = this.searchResults.find(r => r.date === expected.Date);
    assert.ok(actual, `Should have result for ${expected.Date}`);
    assert.strictEqual(actual.zodiacSign, expected['Moon Sign'], 'Zodiac sign should match');
  });
});

// Event Details and Interpretations

When('I view the event details', async function() {
  await this.page.viewEventDetails();
});

Then('I should see the exact time and degree', async function() {
  const details = await this.page.getEventDetails();
  assert.ok(details.time, 'Should show exact time');
  assert.ok(details.degree, 'Should show exact degree');
});

Then('I should see astrological interpretation', async function() {
  const interpretation = await this.page.getInterpretation();
  assert.ok(interpretation && interpretation.length > 0, 'Should show interpretation');
});

Then('I should see how it affects each zodiac sign', async function() {
  const effects = await this.page.getZodiacSignEffects();
  assert.ok(effects && Object.keys(effects).length === 12, 'Should show effects for all 12 signs');
});

Then('I should see recommended activities:', async function(dataTable) {
  const activities = await this.page.getRecommendedActivities();
  dataTable.hashes().forEach(expected => {
    const actual = activities.find(a => a.type === expected['Activity Type']);
    assert.ok(actual, `Should have activity for ${expected['Activity Type']}`);
    assert.ok(actual.recommendation.includes(expected.Recommendation), 'Recommendation should match');
  });
});

// Set Reminders with Timing Options

Given('I am viewing an event on {string}', async function(date) {
  this.currentEvent = { date };
  await this.page.selectEventByDate(date);
});

When('I set a reminder {string} before the event', async function(time) {
  await this.page.setReminder(time);
  this.reminderTime = time;
});

Then('the reminder should be scheduled for {string}', async function(reminderDate) {
  const reminder = await this.calendarService.getReminder(this.currentEvent.date);
  assert.ok(reminder.reminderDate.includes(reminderDate), 'Reminder should be scheduled for correct date');
});

Then('I should receive the notification', async function() {
  // This would typically involve waiting for the notification time
  // For testing purposes, we'll check if the notification is scheduled
  const notification = await this.notificationService.getScheduledNotification(this.currentEvent.date);
  assert.ok(notification, 'Notification should be scheduled');
});

// Moon Phases

When('I enable {string} option', async function(option) {
  await this.page.enableOption(option);
});

Then('I should see moon phase icons for each day', async function() {
  const days = await this.page.getCalendarDays();
  days.forEach(day => {
    assert.ok(day.moonPhaseIcon, 'Each day should show moon phase icon');
  });
});

Then('I should see the phase percentage', async function() {
  const days = await this.page.getCalendarDays();
  days.forEach(day => {
    assert.ok(typeof day.phasePercentage === 'number', 'Each day should show phase percentage');
  });
});

Then('I should see illumination percentage', async function() {
  const days = await this.page.getCalendarDays();
  days.forEach(day => {
    assert.ok(typeof day.illuminationPercentage === 'number', 'Each day should show illumination');
  });
});

Then('I should be able to click for detailed moon information', async function() {
  const days = await this.page.getCalendarDays();
  const firstDay = days[0];
  await firstDay.click();
  const moonInfo = await this.page.getMoonInfo();
  assert.ok(moonInfo, 'Should show detailed moon information');
});

// Eclipse Events

Then('I should see eclipses marked prominently', async function() {
  const eclipses = await this.page.getEclipses();
  assert.ok(eclipses && eclipses.length > 0, 'Should have eclipses');
  eclipses.forEach(eclipse => {
    assert.ok(eclipse.isProminent, 'Eclipse should be prominently marked');
  });
});

Then('I should see:', async function(dataTable) {
  const eclipses = await this.page.getEclipses();
  dataTable.hashes().forEach(expected => {
    const actual = eclipses.find(e => e.date === expected.Date);
    assert.ok(actual, `Should have eclipse on ${expected.Date}`);
    assert.strictEqual(actual.type, expected['Eclipse Type'], 'Eclipse type should match');
    assert.ok(actual.visibility.includes(expected.Visibility), 'Visibility should match');
  });
});

Then('eclipses should have special styling', async function() {
  const eclipses = await this.page.getEclipses();
  eclipses.forEach(eclipse => {
    assert.ok(eclipse.isSpecial, 'Eclipse should have special styling');
  });
});

When('clicking should show eclipse path and visibility', async function() {
  const eclipses = await this.page.getEclipses();
  if (eclipses.length > 0) {
    await eclipses[0].click();
    const details = await this.page.getEclipseDetails();
    assert.ok(details.path, 'Should show eclipse path');
    assert.ok(details.visibility, 'Should show visibility map');
  }
});

// Recurring Reminders

When('I set a recurring reminder for {string}', async function(eventType) {
  await this.page.setRecurringReminder(eventType);
  this.recurringReminder = { eventType };
});

When('I select {string} as frequency', async function(frequency) {
  await this.page.selectFrequency(frequency);
  this.recurringReminder.frequency = frequency;
});

When('I select {string} as reminder time', async function(time) {
  await this.page.selectReminderTime(time);
  this.recurringReminder.reminderTime = time;
});

Then('reminders should be created for all New Moons', async function() {
  const reminders = await this.calendarService.getRecurringReminders('New Moon');
  assert.ok(reminders.length > 0, 'Should have reminders for New Moons');
});

Then('I should receive notifications before each New Moon', async function() {
  const reminders = await this.calendarService.getRecurringReminders('New Moon');
  reminders.forEach(reminder => {
    assert.ok(reminder.notificationScheduled, 'Each reminder should have notification scheduled');
  });
});

Then('I should be able to manage the recurring reminder', async function() {
  const recurringReminder = await this.calendarService.getRecurringReminder('New Moon');
  assert.ok(recurringReminder, 'Should be able to access recurring reminder');
  assert.ok(recurringReminder.canEdit, 'Should be editable');
  assert.ok(recurringReminder.canDelete, 'Should be deletable');
});
