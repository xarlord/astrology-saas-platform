@calendar @integration
Feature: Calendar and Event Management
  As a user
  I want to manage astrology-related events and sync with external calendars
  So that I can stay organized with cosmic timing

  Background:
    Given I am logged in

  # Calendar View
  @calendar @smoke
  Scenario: View calendar with astrological events
    Given I am on the "calendar" page
    Then I should see the current month
    And I should see astrological events including:
      | Event Type     |
      | New Moon       |
      | Full Moon      |
      | Eclipses       |
      | Retrogrades    |
      | Major Aspects  |

  @calendar @navigation
  Scenario: Navigate between months
    Given I am on the "calendar" page
    When I click "Next Month"
    Then I should see the next month's calendar
    When I click "Previous Month"
    Then I should see the previous month's calendar

  @calendar @view-modes
  Scenario Outline: Switch calendar view modes
    Given I am on the "calendar" page
    When I select "<view_mode>" view
    Then I should see events in <view_mode> format

    Examples:
      | view_mode  |
      | Month      |
      | Week       |
      | Day        |
      | List       |

  # Personal Events
  @calendar @events
  Scenario: Add personal event
    Given I am on the "calendar" page
    When I click on date "2026-03-25"
    And I click "Add Event"
    And I fill in:
      | Field       | Value           |
      | Title       | Important Meeting|
      | Time        | 14:00           |
      | Description | Weekly sync     |
    And I save the event
    Then I should see "Important Meeting" on the calendar

  @calendar @events @astrology
  Scenario: Add event with astrological context
    Given I am on the "calendar" page
    When I add an event on "2026-03-25"
    And I enable "Show Astrological Context"
    Then I should see the Moon sign for that date
    And I should see any major transits

  @calendar @events @recurring
  Scenario: Create recurring event
    Given I am on the "calendar" page
    When I add an event
    And I set recurrence to "Weekly"
    And I save the event
    Then I should see the event repeated weekly

  # Google Calendar Integration
  @google-calendar @integration
  Scenario: Connect Google Calendar
    Given I am on the "settings" page
    When I click "Connect Google Calendar"
    And I authorize access
    Then my Google Calendar should be connected
    And I should see Google Calendar events

  @google-calendar @sync
  Scenario: Sync astrological events to Google Calendar
    Given my Google Calendar is connected
    When I click "Sync to Google Calendar"
    And I select events to sync:
      | Event Type |
      | New Moon   |
      | Full Moon  |
    Then events should be added to Google Calendar
    And I should see "Sync completed"

  @google-calendar @export
  Scenario: Export chart creation date to calendar
    Given I am viewing a chart
    When I click "Add Birth Date to Calendar"
    And I select my Google Calendar
    Then the date should be added to Google Calendar

  # Event Reminders
  @calendar @reminders
  Scenario: Set event reminder
    Given I have an event "Important Meeting"
    When I edit the event
    And I set reminder "1 day before"
    And I save the event
    Then I should receive a reminder notification

  @calendar @reminders @multiple
  Scenario: Set multiple reminders
    Given I have an event "Full Moon"
    When I edit the event
    And I set reminders:
      | Timing       |
      | 1 week before|
      | 1 day before |
      | 1 hour before|
    And I save the event
    Then I should receive multiple reminders

  # Event Categories
  @calendar @categories
  Scenario: Categorize events
    Given I am adding an event
    When I select category "Meditation"
    And I save the event
    Then the event should be color-coded
    And I should be able to filter by category

  @calendar @categories @filter
  Scenario: Filter events by category
    Given I have events in multiple categories
    When I filter by category "Meditation"
    Then I should only see Meditation events

  # Calendar Sharing
  @calendar @share
  Scenario: Share calendar
    Given I am on the "calendar" page
    When I click "Share Calendar"
    And I enter email "friend@example.com"
    And I select permission "View only"
    And I click "Share"
    Then the calendar should be shared

  # Event Search
  @calendar @search
  Scenario: Search events
    Given I have multiple events
    When I search for "Full Moon"
    Then I should see all Full Moon events
    And I should see dates highlighted

  # Accessibility
  @calendar @accessibility
  Scenario: Calendar keyboard navigation
    Given I am on the "calendar" page
    When I press arrow keys
    Then I should navigate between dates
    When I press "Enter"
    Then I should see events for that date

  @calendar @accessibility
  Scenario: Calendar screen reader support
    Given I am using a screen reader
    And I am on the "calendar" page
    Then I should hear current date
    And I should hear number of events
    And I should be able to navigate events

  # Mobile
  @calendar @mobile
  Scenario: Calendar on mobile device
    Given I am using a mobile device
    When I view the calendar
    Then I should see mobile-optimized view
    And I should be able to swipe between months
    And I should be able to tap dates for events

  # Performance
  @calendar @performance
  Scenario: Calendar loads efficiently
    Given I have 100+ events
    When I view the calendar
    Then the calendar should load within 2 seconds
    And events should render progressively

  # Offline
  @calendar @offline
  Scenario: View calendar offline
    Given I have viewed the calendar before
    When I lose internet connection
    Then I should still see cached events
    And I should see offline indicator
    When I regain connection
    Then events should sync automatically
