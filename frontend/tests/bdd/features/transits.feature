@transits @forecast @core-feature
Feature: Transit and Progression Analysis
  As a user
  I want to track current planetary transits and their effects
  So that I can understand timing and life cycles

  Background:
    Given I am logged in
    And I have a natal chart

  # Current Transits
  @transits @smoke
  Scenario: View current transits
    Given I have a natal chart for transit analysis
    When I view current transits
    And I select my natal chart "Transit Analysis Chart"
    Then I should see current planetary positions
    And I should see aspects to my natal planets
    And I should see transit effects categorized by:
      | Category     |
      | High Impact  |
      | Moderate     |
      | Minor        |

  @transits @date
  Scenario: View transits for specific date
    Given I have a natal chart for transit analysis
    When I view current transits
    And I select my natal chart
    And I view transits for date "2026-07-15"
    Then I should see planetary positions for that date
    And I should see aspects for that date

  # Transit Forecast
  @transits @forecast
  Scenario: View transit forecast
    Given I have a natal chart for transit analysis
    When I view current transits
    And I view the transit forecast for the next 6 months
    Then I should see major transits in the forecast
    And I should see transit dates for each event
    And I should see interpretations for major events

  @transits @forecast @filter
  Scenario: Filter transit forecast by planet
    Given I am viewing transit forecast
    When I filter by planets "Saturn, Pluto, Uranus"
    Then I should only see transits from selected planets

  @transits @forecast @sort
  Scenario: Sort transit forecast by date
    Given I am viewing transit forecast
    When I sort by "Date" ascending
    Then transits should be in chronological order

  # Progressions
  @progressions @advanced
  Scenario: View secondary progressions
    Given I have a natal chart for transit analysis
    When I view current transits
    And I view secondary progressions
    Then I should see progressed chart positions
    And I should see progressed Moon sign
    And I should see progressed Ascendant

  @progressions @comparison
  Scenario: Compare natal and progressed charts
    Given I am viewing progressions
    When I toggle "Show Natal Comparison"
    Then I should see both charts side by side
    And I should see differences highlighted

  # Solar Returns
  @solar-return @smoke
  Scenario: View solar return chart
    Given I have a natal chart for transit analysis
    When I view my solar return chart
    And I select year 2026
    Then I should see the solar return chart
    And I should see key themes for the year
    And I should see the solar return date

  @solar-return @interpretation
  Scenario: View solar return interpretation
    Given I am viewing my 2026 solar return chart
    Then I should see interpretations for:
      | Area           |
      | Career         |
      | Relationships  |
      | Home           |
      | Personal Growth|

  @solar-return @historical
  Scenario: Compare multiple solar returns
    Given I am viewing my 2026 solar return chart
    When I select "Compare with previous year"
    Then I should see 2025 and 2026 charts side by side
    And I should see theme differences

  # Lunar Returns
  @lunar-return @smoke
  Scenario: View lunar return chart
    Given I have a natal chart for transit analysis
    When I view my lunar return chart
    Then I should see the lunar return chart
    And I should see the lunar return date
    And I should see monthly themes

  @lunar-return @cycle
  Scenario: View lunar return cycle
    Given I am viewing my lunar return chart
    When I click "View Full Cycle"
    Then I should see lunar return dates for the year
    And I should see a calendar view

  # Transit Interpretations
  @transits @interpretation
  Scenario: Request detailed transit interpretation
    Given I am viewing current transits
    When I request detailed transit interpretation
    Then I should see interpretation for each transit
    And I should see timing recommendations

  @transits @interpretation @specific
  Scenario: View interpretation for specific transit
    Given I am viewing current transits
    When I click on "Saturn conjunct Sun"
    Then I should see detailed interpretation
    And I should see dates of influence
    And I should see practical advice

  # Transit Alerts
  @transits @alerts
  Scenario: Set up transit alerts
    Given I am on the "settings" page
    When I enable transit alerts for "Major transits"
    Then I should receive email notifications for major transits

  @transits @alerts @custom
  Scenario: Create custom transit alert
    Given I am on the "settings" page
    When I create an alert for "Saturn transit"
    And I set alert timing "1 week before"
    Then I should receive alerts for Saturn transits

  # Transit Export
  @transits @export
  Scenario: Export transit report
    Given I am viewing transit forecast
    When I click "Export Report"
    And I select format "PDF"
    Then a PDF report should be downloaded
    And the report should include all forecasted transits

  # Premium Features
  @transits @premium
  Scenario: Free user transit limitations
    Given I am a free user
    When I view transit forecast
    Then I should see next 30 days only
    And I should see upgrade prompt for full forecast

  @transits @premium
  Scenario: Premium user full access
    Given I am a premium user
    When I view transit forecast
    Then I should see 12-month forecast
    And I should see all progression features

  # Accessibility
  @transits @accessibility
  Scenario: Transit page keyboard navigation
    Given I am viewing current transits
    When I press "Tab"
    Then focus should move through transit items
    And I should be able to access all features

  @transits @accessibility
  Scenario: Transit screen reader accessibility
    Given I am using a screen reader
    And I am viewing current transits
    Then I should hear transit names announced
    And I should hear dates and aspects

  # Mobile
  @transits @mobile
  Scenario: Transits on mobile device
    Given I am using a mobile device
    When I view current transits
    Then the transit list should be scrollable
    And I should be able to tap for details

  # Integration with Calendar
  @transits @calendar @integration
  Scenario: Add transit to calendar
    Given I am viewing a major transit
    When I click "Add to Calendar"
    Then the transit should be added to my calendar
    And I should see it in my calendar view
