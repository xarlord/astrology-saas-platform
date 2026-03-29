Feature: Natal Chart Management
  As a user of the astrological platform
  I want to create, view, and edit my natal chart
  So that I can get accurate astrological insights about myself

  Background:
    Given the application is running
    And I am logged in as a registered user
    And the natal chart service is available

  Scenario: Create natal chart with all required data
    Given I am on the "Create Natal Chart" page
    When I enter my birth date "1990-05-15"
    And I enter my birth time "14:30"
    And I select my birth place "New York, USA"
    With coordinates:
      | latitude  | 40.7128    |
      | longitude | -74.0060   |
      | timezone  | America/New_York |
    And I enter my name "John Doe"
    And I click the "Generate Chart" button
    Then my natal chart should be created successfully
    And I should see my chart visualization
    And I should see the planetary positions
    And I should see my ascendant sign
    And I should see my sun, moon, and rising signs
    And the chart should be saved to my profile

  Scenario: Create natal chart with unknown birth time
    Given I am on the "Create Natal Chart" page
    When I enter my birth date "1990-05-15"
    And I select "Unknown time" option
    And I select my birth place "New York, USA"
    And I enter my name "John Doe"
    And I click the "Generate Chart" button
    Then my natal chart should be created with a noon time default
    And I should see a warning "House divisions may be inaccurate"
    And I should see planetary positions
    And I should not see house cusps

  Scenario: Create natal chart with invalid data
    Given I am on the "Create Natal Chart" page
    When I leave the birth date field empty
    And I enter my birth time "14:30"
    And I select my birth place "New York, USA"
    And I click the "Generate Chart" button
    Then I should see validation errors
    And I should see the message "Birth date is required"
    And the chart should not be created

  Scenario: Create multiple natal charts for different people
    Given I am on the dashboard
    When I click "Add New Chart"
    And I enter the name "Jane Doe"
    And I enter birth date "1985-08-22"
    And I enter birth time "09:15"
    And I select birth place "Los Angeles, USA"
    And I click the "Generate Chart" button
    Then the chart for "Jane Doe" should be created
    And I should see it in my chart list
    And I should be able to switch between charts

  Scenario: View natal chart details
    Given I have a natal chart named "My Birth Chart"
    And I am on the dashboard
    When I click on "My Birth Chart"
    Then I should see the chart visualization
    And I should see the following planetary positions:
      | Planet    | Sign    | Degree  | House   |
      | Sun       | Taurus  | 25.32   | 1       |
      | Moon      | Cancer  | 12.45   | 3       |
      | Mercury   | Taurus  | 18.90   | 1       |
      | Venus     | Gemini  | 5.67    | 2       |
      | Mars      | Aries   | 22.15   | 12      |
    And I should see aspects between planets
    And I should see house cusps
    And I should see element distribution:
      | Element  | Count   |
      | Fire     | 3       |
      | Earth    | 4       |
      | Air      | 2       |
      | Water    | 3       |

  Scenario: Edit natal chart birth information
    Given I have a natal chart with birth date "1990-05-15"
    And I am viewing the chart details
    When I click the "Edit" button
    And I change the birth date to "1990-05-16"
    And I click the "Save" button
    Then the chart should be recalculated
    And I should see updated planetary positions
    And I should see a success message "Chart updated successfully"

  Scenario: Edit natal chart with corrected time
    Given I have a natal chart with birth time "14:30"
    And the original chart shows Aries ascendant
    And I am viewing the chart details
    When I click the "Edit" button
    And I change the birth time to "16:45"
    And I click the "Save" button
    Then the ascendant should be recalculated
    And the house cusps should be updated
    And I should see the new ascendant sign

  Scenario: Delete natal chart
    Given I have a natal chart named "Test Chart"
    And I am on my charts list
    When I click the delete button for "Test Chart"
    And I confirm the deletion
    Then "Test Chart" should be removed from my list
    And I should see a success message "Chart deleted successfully"
    And the chart should not be recoverable

  Scenario: Search and filter charts
    Given I have multiple natal charts:
      | Name         | Birth Date  |
      | John Doe     | 1990-05-15  |
      | Jane Smith   | 1985-08-22  |
      | Bob Johnson  | 1995-03-10  |
    And I am on the charts list page
    When I search for "John"
    Then I should see only "John Doe" in the results
    When I filter by birth year "1990"
    Then I should see only charts from 1990

  Scenario: Export natal chart as PDF
    Given I have a natal chart named "My Birth Chart"
    And I am viewing the chart details
    When I click the "Export" button
    And I select "PDF" format
    Then a PDF file should be downloaded
    And the PDF should contain the chart visualization
    And the PDF should contain all planetary positions
    And the PDF should contain aspect details

  Scenario Outline: Create chart with various locations
    Given I am on the "Create Natal Chart" page
    When I enter my birth date "1990-05-15"
    And I enter my birth time "14:30"
    And I select my birth place "<location>"
    And I click the "Generate Chart" button
    Then the chart should be created with timezone "<timezone>"
    And the coordinates should be:
      | latitude  | <lat>  |
      | longitude | <lng>  |

    Examples:
      | location          | timezone              | lat      | lng       |
      | New York, USA     | America/New_York      | 40.7128  | -74.0060  |
      | London, UK        | Europe/London         | 51.5074  | -0.1278   |
      | Tokyo, Japan      | Asia/Tokyo            | 35.6762  | 139.6503  |
      | Sydney, Australia | Australia/Sydney      | -33.8688 | 151.2093  |

  Scenario: View chart interpretation
    Given I have a natal chart named "My Birth Chart"
    And I am viewing the chart details
    When I click the "Interpretation" tab
    Then I should see a detailed personality reading
    And I should see insights about my sun sign
    And I should see insights about my moon sign
    And I should see insights about my rising sign
    And I should see dominant elements
    And I should see strengths and challenges
