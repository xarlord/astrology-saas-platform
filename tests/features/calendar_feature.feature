Feature: Calendar Feature
  As a user of the astrological platform
  I want to view astrological events and manage my calendar
  So that I can plan my activities according to cosmic events

  Background:
    Given the application is running
    And I am logged in as a registered user
    And the calendar service is available
    And ephemeris data is loaded

  Scenario: View monthly calendar with astrological events
    Given I am on the calendar page
    And I am viewing the month of "January 2026"
    Then I should see a calendar grid for the month
    And I should see the following astrological events:
      | Date       | Event Type          | Description                      |
      | 2026-01-13 | New Moon            | New Moon in Capricorn            |
      | 2026-01-21 | Sun Enters Aquarius  | Sun moves into Aquarius          |
      | 2026-01-28 | Full Moon           | Full Moon in Leo                 |
      | 2026-01-29 | Mercury Retrograde  | Mercury goes retrograde          |
    And the events should be color-coded by type

  Scenario: View daily astrological events
    Given I am on the calendar page
    When I click on the day "January 13, 2026"
    Then I should see detailed events for that day
    And I should see the New Moon at "23:45 UTC"
    And I should see affected zodiac signs
    And I should see recommended activities
    And I should see aspects for that day

  Scenario: Set reminder for astrological event
    Given I am viewing the event "New Moon in Capricorn" on "2026-01-13"
    When I click the "Set Reminder" button
    And I select "1 day before" as reminder time
    And I select "Email" as reminder method
    And I click "Save Reminder"
    Then a reminder should be scheduled
    And I should see a confirmation "Reminder set successfully"
    And I should receive a reminder on "2026-01-12"

  Scenario: Set multiple reminders for different events
    Given I am on the calendar page
    And I set a reminder for "New Moon in Capricorn" 1 day before
    And I set a reminder for "Full Moon in Leo" 2 days before
    And I set a reminder for "Mercury Retrograde" 3 days before
    Then I should have 3 active reminders
    And I should see all reminders in my reminder list
    And each reminder should show the event date and reminder time

  Scenario: Edit reminder
    Given I have a reminder set for "New Moon in Capricorn" 1 day before
    And I am viewing my reminders
    When I click the "Edit" button for the reminder
    And I change the reminder time to "2 days before"
    And I add "SMS" as an additional reminder method
    And I click "Save"
    Then the reminder should be updated
    And I should receive reminders via both email and SMS
    And I should see a confirmation "Reminder updated"

  Scenario: Delete reminder
    Given I have a reminder set for "Full Moon in Leo"
    And I am viewing my reminders
    When I click the "Delete" button for the reminder
    And I confirm the deletion
    Then the reminder should be removed
    And I should see a confirmation "Reminder deleted"
    And I should not receive any notification for the event

  Scenario: View personal transits on calendar
    Given I have a natal chart with Sun at "25° Taurus"
    And I am on the calendar page for "May 2026"
    Then I should see my personal transits marked
    And I should see when Mercury conjuncts my Sun
    And I should see when Venus opposes my Sun
    And I should see when Mars squares my Sun
    And the events should be labeled "Personal Transit"

  Scenario: Filter calendar events by type
    Given I am on the calendar page
    And the calendar shows multiple event types
    When I select "Lunar Events" filter
    Then I should see only New Moons and Full Moons
    When I select "Planetary Movements" filter
    Then I should see only sign changes and ingresses
    When I select "Retrograde Periods" filter
    Then I should see only retrograde stations

  Scenario: Navigate between months
    Given I am viewing the calendar for "January 2026"
    When I click the "Next Month" button
    Then I should see the calendar for "February 2026"
    And the events should be updated for February
    When I click the "Previous Month" button
    Then I should see the calendar for "January 2026" again
    And I should see a "Today" button
    When I click the "Today" button
    Then I should see the calendar for the current month

  Scenario: Export calendar to iCal format
    Given I am on the calendar page
    And I have selected events to export:
      | Event               |
      | New Moon in Capricorn |
      | Full Moon in Leo    |
    When I click the "Export" button
    And I select "iCal" format
    And I click "Download"
    Then an .ics file should be downloaded
    And the file should contain the selected events
    And the file should be compatible with calendar applications

  Scenario: Export calendar to Google Calendar
    Given I am on the calendar page
    When I click the "Export" button
    And I select "Google Calendar"
    Then I should be redirected to Google Calendar
    And the events should be pre-populated
    And I should confirm the import

  Scenario: Search for specific event type
    Given I am on the calendar page
    And I am viewing the year "2026"
    When I search for "Full Moon"
    Then I should see all Full Moons in 2026
    And I should see their dates and zodiac signs
    And the results should be:
      | Date       | Moon Sign |
      | 2026-01-28 | Leo       |
      | 2026-02-27 | Virgo     |
      | 2026-03-29 | Libra     |

  Scenario: View event details and interpretations
    Given I am on the calendar page
    And I click on the event "New Moon in Capricorn"
    When I view the event details
    Then I should see the exact time and degree
    And I should see astrological interpretation
    And I should see how it affects each zodiac sign
    And I should see recommended activities:
      | Activity Type  | Recommendation            |
      | Business       | Set new career goals      |
      | Relationship   | Have serious conversations|
      | Health         | Start a fitness routine   |

  Scenario Outline: Set reminders with different timing options
    Given I am viewing an event on "2026-01-13"
    When I set a reminder "<time>" before the event
    Then the reminder should be scheduled for "<reminder_date>"
    And I should receive the notification

    Examples:
      | time        | reminder_date |
      | 1 hour      | 2026-01-13 22:45 |
      | 1 day       | 2026-01-12     |
      | 3 days      | 2026-01-10     |
      | 1 week      | 2026-01-06     |

  Scenario: View lunar phases throughout the month
    Given I am on the calendar page for "January 2026"
    When I enable "Show Moon Phases" option
    Then I should see moon phase icons for each day
    And I should see the phase percentage
    And I should see illumination percentage
    And I should be able to click for detailed moon information

  Scenario: View eclipse events
    Given I am on the calendar page for "2026"
    Then I should see eclipses marked prominently
    And I should see:
      | Date       | Eclipse Type       | Visibility        |
      | 2026-03-14 | Total Lunar Eclipse | Europe, Africa   |
      | 2026-03-29 | Total Solar Eclipse | Arctic, Russia   |
    And eclipses should have special styling
    And clicking should show eclipse path and visibility

  Scenario: Set recurring reminders for regular events
    Given I am on the calendar page
    When I set a recurring reminder for "New Moon"
    And I select "Every month" as frequency
    And I select "1 day before" as reminder time
    Then reminders should be created for all New Moons
    And I should receive notifications before each New Moon
    And I should be able to manage the recurring reminder
