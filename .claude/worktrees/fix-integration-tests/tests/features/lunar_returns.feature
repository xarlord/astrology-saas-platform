Feature: Lunar Returns
  As a user of the astrological platform
  I want to track and analyze my lunar returns
  So that I can understand my emotional cycles and plan accordingly

  Background:
    Given the application is running
    And I am logged in as a registered user
    And I have a natal chart with:
      | Field         | Value              |
      | Name          | John Doe           |
      | Birth Date    | 1990-05-15         |
      | Birth Time    | 14:30              |
      | Birth Place   | New York, USA      |
      | Moon Position | 15° Cancer 32'     |

  Scenario: Calculate next lunar return
    Given I am on the "Lunar Returns" page
    When I request the next lunar return
    Then I should see the next lunar return date
    And I should see the exact time of the return
    And I should see the location of the return
    And I should see the lunar return chart preview
    And the data should include:
      | Field           | Value              |
      | Date            | 2026-02-20         |
      | Time            | 14:32 UTC          |
      | Moon Position   | 15° Cancer 32'     |
      | Sun Position    | 1° Pisces 45'      |
      | Ascendant       | 23° Scorpio 18'    |

  Scenario: View monthly forecast based on lunar return
    Given I have calculated my lunar return for "February 2026"
    And I am on the lunar return details page
    When I click the "Monthly Forecast" tab
    Then I should see a forecast for the lunar month
    And I should see the emotional themes for the month
    And I should see key dates:
      | Date       | Theme                    |
      | 2026-02-25 | Emotional High           |
      | 2026-03-05 | Relationship Focus       |
      | 2026-03-12 | Career Development       |
    And I should see recommended activities for each theme
    And I should see potential challenges

  Scenario: View past lunar returns for pattern analysis
    Given I am on the "Lunar Returns" page
    When I select the "History" tab
    Then I should see a list of past lunar returns:
      | Month      | Date        | Key Events                    |
      | January    | 2026-01-23  | Career breakthrough           |
      | December   | 2025-12-26  | Relationship challenges       |
      | November   | 2025-11-28  | Personal growth opportunity   |
    And I should be able to click on each for details
    And I should see patterns across months

  Scenario: Compare multiple lunar returns
    Given I have viewed my last 3 lunar returns
    And I am on the "Lunar Returns" page
    When I select "Compare Returns"
    And I select 3 consecutive months
    Then I should see a comparison view
    And I should see recurring themes
    And I should see progression of house positions
    And I should see aspects that repeat
    And I should see a pattern analysis

  Scenario: Set reminder for next lunar return
    Given I have calculated my next lunar return for "2026-02-20"
    And I am on the lunar return details page
    When I click "Set Reminder"
    And I select "3 days before" as reminder time
    And I click "Save"
    Then a reminder should be created
    And I should receive a notification on "2026-02-17"
    And the notification should include preparation tips

  Scenario: View lunar return chart interpretation
    Given I am viewing a lunar return for "February 2026"
    When I click the "Interpretation" button
    Then I should see detailed insights
    And I should see the house focus for the month
    And I should see dominant elements
    And I should see key aspects:
      | Aspect        | Planets                  | Meaning              |
      | Conjunction   | Moon & Venus            | Emotional harmony    |
      | Opposition    | Sun & Saturn            | Challenge authority  |
      | Trine         | Mars & Jupiter          | Energy for action    |
    And I should see recommendations for the month

  Scenario: Calculate lunar return for specific location
    Given I am on the "Lunar Returns" page
    When I select "Calculate for Location"
    And I enter "Tokyo, Japan"
    And I click "Calculate"
    Then I should see the lunar return time for Tokyo
    And I should see the house positions adjusted for Tokyo
    And I should see the ascendant for Tokyo location
    And I should be able to compare with my natal location

  Scenario: View emotional forecast themes
    Given I am viewing a lunar return for "February 2026"
    And the Moon is in the 4th house
    When I view the forecast
    Then I should see "Home and Family" as a primary theme
    And I should see related recommendations:
      | Recommendation                    | Priority |
      | Focus on home projects            | High     |
      | Spend time with family            | High     |
      | Address domestic issues           | Medium   |
      | Emotional self-care               | High     |

  Scenario: Track emotional patterns across lunar returns
    Given I have viewed 6 consecutive lunar returns
    And I am on the "Pattern Analysis" page
    Then I should see a graph of emotional cycles
    And I should see high and low periods marked
    And I should see average emotional intensity
    And I should see recurring themes:
      | Theme          | Frequency | Months          |
      | Career Focus   | 4/6       | Feb, Apr, Jun   |
      | Relationship   | 3/6       | Mar, May        |
      | Personal Growth| 5/6       | Feb, Mar, Apr   |

  Scenario: View lunar return aspects to natal chart
    Given I am viewing a lunar return for "February 2026"
    When I click the "Aspects to Natal" tab
    Then I should see aspects between lunar return and natal chart
    And I should see:
      | Return Planet | Natal Planet | Aspect    | Orb   |
      | Sun           | Moon         | Square    | 3°    |
      | Moon          | Venus        | Trine     | 2°    |
      | Mercury       | Mercury      | Opposition| 5°    |
    And I should see interpretation of each aspect

  Scenario: Create lunar return journal entry
    Given I am viewing a lunar return for "February 2026"
    When I click "Add Journal Entry"
    And I enter my thoughts for the lunar month
    And I set goals for the month
    And I click "Save"
    Then the journal entry should be saved
    And I should be able to reference it later
    And I should see it linked to the lunar return

  Scenario: Export lunar return report
    Given I am viewing a lunar return for "February 2026"
    When I click "Export Report"
    And I select "PDF" format
    And I include charts and interpretations
    And I click "Download"
    Then a PDF report should be generated
    And the PDF should contain the lunar return chart
    And the PDF should contain the monthly forecast
    And the PDF should contain aspect interpretations
    And the PDF should contain recommendations

  Scenario Outline: Lunar return themes by house
    Given I have a lunar return with Moon in the "<house>"
    When I view the monthly forecast
    Then I should see "<theme>" as the primary theme
    And I should see appropriate recommendations

    Examples:
      | house | theme               |
      | 1st   | Self-Identity       |
      | 2nd   | Finances & Values   |
      | 3rd   | Communication       |
      | 4th   | Home & Family       |
      | 5th   | Creativity & Romance|
      | 6th   | Work & Health       |
      | 7th   | Partnerships        |
      | 8th   | Transformation      |
      | 9th   | Higher Learning     |
      | 10th  | Career & Status     |
      | 11th  | Social & Goals      |
      | 12th  | Spirituality        |

  Scenario: View lunar return phase
    Given I am viewing a lunar return for "February 2026"
    Then I should see the lunar phase at the time of return
    And I should see if it's a New, Waxing, Full, or Waning phase
    And I should see how the phase affects the lunar month
    And I should see phase-specific recommendations

  Scenario: Compare lunar return with solar return
    Given I have viewed my lunar return for "February 2026"
    And I have viewed my solar return for "2026"
    When I click "Compare with Solar Return"
    Then I should see side-by-side comparison
    And I should see how lunar themes align with solar themes
    And I should see integrated recommendations
    And I should see priority focus areas for the year
