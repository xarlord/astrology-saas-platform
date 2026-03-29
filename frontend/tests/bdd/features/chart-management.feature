@charts @core-feature
Feature: Natal Chart Management
  As a registered user
  I want to create, view, edit, and manage my natal charts
  So that I can analyze astrological data for different people

  Background:
    Given I am logged in

  # Chart Creation
  @chart-creation @smoke
  Scenario: Create a natal chart with complete information
    Given I am on the "chart creation" page
    When I create a chart with the following details:
      | Name          | Birth Date  | Birth Time | Birth Location      |
      | Personal Chart| 1990-06-15  | 14:30      | New York, NY, USA   |
    And I submit the chart creation form
    Then the chart should be created
    And I should see the chart visualization
    And I should see interpretations for:
      | Element    |
      | Sun        |
      | Moon       |
      | Ascendant  |
      | Mercury    |
      | Venus      |
      | Mars       |

  @chart-creation @location
  Scenario: Create chart with location autocomplete
    Given I am on the "chart creation" page
    When I fill in "Birth Location" with "New York"
    Then I should see location suggestions
    When I select "New York, NY, USA" from suggestions
    Then the location field should contain "New York, NY, USA"
    And the latitude field should be auto-filled
    And the longitude field should be auto-filled

  @chart-creation @validation
  Scenario Outline: Chart creation validation - required fields
    Given I am on the "chart creation" page
    When I create a chart with the following details:
      | Name        | Birth Date  | Birth Time | Birth Location |
      | <name>      | <date>      | <time>     | <location>     |
    And I submit the chart creation form
    Then I should see an error message "<error>"

    Examples:
      | name    | date       | time  | location        | error                 |
      |         | 1990-06-15 | 14:30 | New York, NY    | Name is required      |
      | My Chart|            | 14:30 | New York, NY    | Birth date is required|
      | My Chart| 1990-06-15 |       | New York, NY    | Birth time is required|
      | My Chart| 1990-06-15 | 14:30 |                 | Location is required  |

  @chart-creation @validation
  Scenario: Chart creation validation - invalid date
    Given I am on the "chart creation" page
    When I create a chart with the following details:
      | Name     | Birth Date | Birth Time | Birth Location |
      | My Chart | invalid    | 14:30      | New York, NY   |
    And I submit the chart creation form
    Then I should see an error message "Invalid date format"

  @chart-creation @validation
  Scenario: Chart creation validation - future date
    Given I am on the "chart creation" page
    When I create a chart with the following details:
      | Name     | Birth Date | Birth Time | Birth Location |
      | My Chart | 2030-01-01 | 14:30      | New York, NY   |
    And I submit the chart creation form
    Then I should see an error message "Birth date cannot be in the future"

  @chart-creation @ux
  Scenario: Create chart with unknown birth time
    Given I am on the "chart creation" page
    When I create a chart with the following details:
      | Name     | Birth Date | Birth Time | Birth Location |
      | My Chart | 1990-06-15 | Unknown    | New York, NY   |
    And I check "Use noon as default time"
    And I submit the chart creation form
    Then the chart should be created
    And I should see a note about unknown birth time

  @chart-creation @batch
  Scenario: Create multiple charts in succession
    Given I have no saved charts
    When I create a chart named "Chart 1"
    And I create a chart named "Chart 2"
    And I create a chart named "Chart 3"
    Then I should have 3 saved charts

  # Chart Viewing
  @chart-view @smoke
  Scenario: View saved charts list
    Given I have 3 saved charts
    When I view my charts list
    Then I should see 3 charts
    And each chart should display:
      | Information |
      | Name        |
      | Birth Date  |
      | Sun Sign    |
      | Moon Sign   |
      | Ascendant   |

  @chart-view @smoke
  Scenario: View chart details
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    Then I should see the chart details for "Personal Chart"
    And I should see the chart visualization
    And I should see planetary positions table
    And I should see house cusps

  @chart-view @interpretation
  Scenario: View chart interpretations
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    Then I should see interpretations for:
      | Element     |
      | Sun Sign    |
      | Moon Sign   |
      | Ascendant   |
      | Aspects     |

  @chart-view @detailed
  Scenario: Request detailed interpretation
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    And I request a detailed interpretation
    Then I should see detailed analysis of:
      | Section          |
      | Personality      |
      | Relationships    |
      | Career           |
      | Life Path        |
      | Challenges       |
      | Strengths        |

  # Chart Editing
  @chart-edit @smoke
  Scenario: Edit chart name
    Given I have a chart named "Personal Chart"
    When I edit the chart "Personal Chart"
    And I update the chart name to "Updated Chart Name"
    Then the chart should be updated
    And I should see "Updated Chart Name" in my charts

  @chart-edit @validation
  Scenario: Edit chart with invalid data
    Given I have a chart named "Personal Chart"
    When I edit the chart "Personal Chart"
    And I clear the name field
    And I submit the form
    Then I should see an error message "Name is required"

  # Chart Deletion
  @chart-delete @smoke
  Scenario: Delete a chart
    Given I have a chart named "Chart to Delete"
    When I delete the chart "Chart to Delete"
    Then the chart should be deleted
    And I should not see "Chart to Delete" in my charts

  @chart-delete @confirmation
  Scenario: Cancel chart deletion
    Given I have a chart named "Important Chart"
    When I click delete on "Important Chart"
    And I click "Cancel" on the confirmation dialog
    Then the chart should not be deleted
    And I should see "Important Chart" in my charts

  # Chart Search and Filter
  @chart-search @ux
  Scenario: Search charts by name
    Given I have charts named "John's Chart", "Jane's Chart", "Family Chart"
    When I search for charts with name "John"
    Then I should see charts matching "John"
    And I should not see "Jane's Chart"
    And I should not see "Family Chart"

  @chart-filter @ux
  Scenario: Filter charts by date range
    Given I have charts with various dates
    When I filter charts by date range "1990-01-01" to "1995-12-31"
    Then I should only see charts within that date range

  @chart-sort @ux
  Scenario: Sort charts by creation date
    Given I have 5 saved charts
    When I sort charts by "Creation Date" descending
    Then the most recent chart should be first

  # Chart Export
  @chart-export @pdf
  Scenario: Export chart as PDF
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    And I export the chart as "PDF"
    Then the chart should be downloaded as ".pdf"

  @chart-export @image
  Scenario: Export chart as image
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    And I export the chart as "PNG"
    Then the chart should be downloaded as ".png"

  # Chart Sharing
  @chart-share @social
  Scenario: Share chart via email
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    And I share the chart with email "friend@example.com"
    Then the chart should be shared
    And I should see "Chart shared successfully"

  @chart-share @link
  Scenario: Generate shareable link
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    And I click "Generate Share Link"
    Then I should see a shareable URL
    And the link should expire in 7 days

  # Chart Comparison
  @chart-compare @premium
  Scenario: Compare two charts side by side
    Given I have charts named "Chart A" and "Chart B"
    When I select both charts for comparison
    Then I should see both charts side by side
    And I should see aspect connections between them

  # Chart Limits
  @chart-limit @free-tier
  Scenario: Free user chart limit
    Given I am a free user
    And I have 5 saved charts
    When I try to create another chart
    Then I should see "Chart limit reached"
    And I should be prompted to upgrade

  @chart-limit @premium
  Scenario: Premium user unlimited charts
    Given I am a premium user
    When I create 20 charts
    Then all charts should be created successfully

  # Chart Visualization Options
  @chart-display @ux
  Scenario: Toggle chart display options
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    And I toggle "Show Aspects"
    Then aspect lines should be visible
    When I toggle "Show House Numbers"
    Then house numbers should be visible

  @chart-display @theme
  Scenario: Change chart visual theme
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    And I select theme "Dark Mode"
    Then the chart should use dark colors

  # Accessibility
  @chart-a11y @accessibility
  Scenario: Chart screen reader accessibility
    Given I am using a screen reader
    And I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    Then I should hear "Chart for Personal Chart"
    And I should hear planetary positions announced
    And I should hear house placements announced

  @chart-a11y @accessibility
  Scenario: Keyboard navigation in chart view
    Given I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    And I press "Tab"
    Then focus should move through interactive elements
    And I should be able to access all chart features

  # Mobile
  @chart-mobile @responsive
  Scenario: View charts on mobile
    Given I am using a mobile device
    And I have 3 saved charts
    When I view my charts list
    Then charts should be displayed in a single column
    And each chart should be tappable

  @chart-mobile @responsive
  Scenario: Chart visualization on mobile
    Given I am using a mobile device
    And I have a chart named "Personal Chart"
    When I view the chart "Personal Chart"
    Then the chart should be responsive
    And I should be able to zoom and pan
