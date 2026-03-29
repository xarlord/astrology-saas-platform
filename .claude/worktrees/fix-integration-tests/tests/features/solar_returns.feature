Feature: Solar Returns
  As a user of the astrological platform
  I want to view and analyze my solar returns
  So that I can understand my yearly themes and plan my year effectively

  Background:
    Given the application is running
    And I am logged in as a registered user
    And I have a natal chart with:
      | Name       | John Doe           |
      | Birth Date | 1990-05-15         |
      | Birth Time | 14:30              |
      | Birth Place| New York, USA      |
      | Sun Sign   | Taurus             |

  Scenario: Calculate solar return for current year
    Given I am on the "Solar Returns" page
    And I want to view my solar return for 2026
    When I select the year "2026"
    And I click "Calculate Solar Return"
    Then I should see the solar return date
    And I should see the exact time of the solar return
    And I should see the solar return chart
    And I should see:
      | Field           | Value                  |
      | Date            | 2026-05-15             |
      | Time            | 10:42 AM EDT           |
      | Sun Position    | 25° Taurus 00'         |
      | Ascendant       | 18° Cancer 15'         |
      | MC              | 12° Pisces 45'         |

  Scenario: View solar return interpretation
    Given I have calculated my solar return for 2026
    And I am viewing the solar return chart
    When I click the "Interpretation" tab
    Then I should see the year's major themes
    And I should see the house focus for the year
    And I should see dominant elements
    And I should see key aspects in the solar return chart
    And I should see predictions for different life areas:
      | Life Area     | Prediction                    |
      | Career        | Promotion opportunities       |
      | Relationships | Partnership growth           |
      | Health        | Focus on physical wellness   |
      | Finance       | Investment opportunities     |

  Scenario: Relocate solar return to different location
    Given I have calculated my solar return for 2026
    And the original location is "New York, USA"
    When I click "Relocate Solar Return"
    And I enter "London, UK" as new location
    And I click "Calculate"
    Then I should see the solar return chart for London
    And I should see the relocated time
    And I should see the new ascendant
    And I should see how houses shift
    And I should see:
      | Location    | Ascendant    | House Changes               |
      | New York    | 18° Cancer   | Sun in 11th house           |
      | London      | 12° Gemini   | Sun in 12th house           |
      | Tokyo       | 5° Taurus    | Sun in 1st house            |
    And I should see which location is most favorable

  Scenario: Compare multiple relocation options
    Given I am on the "Solar Returns" page for 2026
    And I want to find the best location
    When I select "Compare Locations"
    And I enter multiple locations:
      | Location          | Country      |
      | London            | UK           |
      | Tokyo             | Japan        |
      | Sydney            | Australia    |
      | Paris             | France       |
    And I click "Compare All"
    Then I should see a comparison table
    And I should see ratings for each location:
      | Location  | Career | Love | Health | Travel | Overall |
      | London    | 8      | 7    | 6      | 9      | 7.5     |
      | Tokyo     | 7      | 6    | 8      | 7      | 7.0     |
      | Sydney    | 6      | 9    | 7      | 8      | 7.5     |
      | Paris     | 7      | 8    | 7      | 8      | 7.5     |
    And I should see recommendations

  Scenario: Save solar return chart
    Given I have calculated my solar return for 2026
    And I am viewing the chart
    When I click "Save Chart"
    And I enter a name "Solar Return 2026 - New York"
    And I click "Save"
    Then the solar return should be saved
    And I should see it in my saved solar returns list
    And I should be able to access it later

  Scenario: Track yearly patterns
    Given I have saved solar returns for multiple years
    And I have returns for: 2020, 2021, 2022, 2023, 2024, 2025
    When I click "Pattern Analysis"
    Then I should see a visual representation of patterns
    And I should see recurring themes
    And I should see:
      | Year  | Ascendant    | Sun House | Major Theme          |
      | 2020  | 15° Leo      | 10th      | Career Focus         |
      | 2021  | 22° Virgo    | 6th       | Health & Service     |
      | 2022  | 8° Scorpio   | 8th       | Transformation       |
      | 2023  | 14° Sagittarius| 9th    | Education & Travel   |
      | 2024  | 19° Capricorn| 11th      | Social & Goals       |
      | 2025  | 25° Aquarius  | 2nd       | Finances & Values    |
    And I should see long-term cycles

  Scenario: View solar return aspects to natal chart
    Given I am viewing my 2026 solar return
    When I click "Aspects to Natal" tab
    Then I should see aspects between solar return and natal chart
    And I should see:
      | Solar Return Planet | Natal Planet | Aspect   | Orb  | Meaning               |
      | Sun                  | MC           | Conjunction| 2°  | Career prominence     |
      | Moon                 | Venus        | Trine     | 3°   | Emotional harmony    |
      | Mercury              | Jupiter      | Square    | 4°   | Learning challenges  |
    And I should see interpretation of each aspect

  Scenario: Set reminders for solar return
    Given I have calculated my solar return for 2026
    And the date is "2026-05-15"
    When I click "Set Reminder"
    And I select "1 week before" as reminder time
    And I click "Save"
    Then a reminder should be created
    And I should receive a notification on "2026-05-08"
    And the notification should include preparation tips for the year

  Scenario: View monthly breakdown for solar return year
    Given I am viewing my 2026 solar return
    And the solar return date is "2026-05-15"
    When I click "Monthly Forecast"
    Then I should see a month-by-month breakdown
    And I should see key themes for each month:
      | Month     | Primary Theme          | Key Dates     |
      | June      | New Beginnings         | 15, 22        |
      | July      | Relationship Focus     | 3, 18, 29     |
      | August    | Career Development     | 8, 21         |
    And I should see transits that activate the solar return

  Scenario: View solar return house placements
    Given I am viewing my 2026 solar return
    And I am on the "House Placements" tab
    Then I should see which solar return planets are in which houses
    And I should see:
      | Planet    | Solar Return House | Natal House | Meaning               |
      | Sun       | 11th               | 1st         | Social recognition    |
      | Moon      | 3rd                | 2nd         | Communication         |
      | Mercury   | 11th               | 1st         | Intellectual goals    |
      | Venus     | 12th               | 2nd         | Spiritual love        |
      | Mars      | 10th               | 12th        | Career action         |
    And I should see interpretations

  Scenario: Compare solar return with lunar returns
    Given I have my 2026 solar return calculated
    And I have lunar returns for the same year
    When I click "Compare with Lunar Returns"
    Then I should see how they work together
    And I should see the interaction between solar and lunar themes
    And I should see a combined forecast
    And I should see key periods when both align

  Scenario: Export solar return report
    Given I am viewing my 2026 solar return
    When I click "Export Report"
    And I select "PDF" format
    And I include charts and interpretations
    And I click "Download"
    Then a comprehensive PDF should be generated
    And the PDF should contain:
      | Section                    | Included |
      | Solar Return Chart         | Yes      |
      | Yearly Interpretation      | Yes      |
      | Monthly Breakdown          | Yes      |
      | Aspect Analysis            | Yes      |
      | Recommendations            | Yes      |

  Scenario Outline: Solar return themes by Sun house
    Given I have a solar return with Sun in the "<house>"
    When I view the yearly interpretation
    Then the primary theme should be "<theme>"
    And I should see "<focus>" as the main focus area

    Examples:
      | house | theme               | focus                     |
      | 1st   | Personal Identity   | Self-development, new starts|
      | 2nd   | Finances            | Money, values, possessions |
      | 3rd   | Communication       | Learning, writing, siblings|
      | 4th   | Home & Family       | Domestic life, foundations |
      | 5th   | Creativity          | Romance, children, fun    |
      | 6th   | Work & Health       | Service, routine, wellness|
      | 7th   | Partnerships        | Relationships, marriage   |
      | 8th   | Transformation      | Death, taxes, inheritance |
      | 9th   | Higher Learning     | Travel, education, philosophy|
      | 10th  | Career              | Status, achievement, goals|
      | 11th  | Social & Goals      | Friends, networks, hopes  |
      | 12th  | Spirituality        | Solitude, endings, unseen|

  Scenario: View solar return ruler and its placement
    Given I am viewing my 2026 solar return
    And the ascendant is 18° Cancer
    And the ruler of Cancer is the Moon
    When I click "Chart Ruler"
    Then I should see the Moon's placement in the solar return
    And I should see the Moon's house and sign
    And I should see aspects to the Moon
    And I should see how the ruler influences the year

  Scenario: View planetary strength in solar return
    Given I am viewing my 2026 solar return
    When I click "Planetary Strength" tab
    Then I should see which planets are strongest
    And I should see essential dignity scores
    And I should see:
      | Planet    | Strength Score | Status     |
      | Sun       | 25             | Strong     |
      | Moon      | 18             | Moderate   |
      | Mercury   | 12             | Weak       |
      | Venus     | 22             | Strong     |
      | Mars      | 15             | Moderate   |
    And I should see how to work with each planet

  Scenario: Create solar return journal
    Given I am viewing my 2026 solar return
    When I click "Create Journal"
    And I set intentions for the year
    And I enter goals for each life area
    And I click "Save"
    Then the journal should be created
    And I should be able to track progress
    And I should be able to review at year end

  Scenario: View solar return timing techniques
    Given I am viewing my 2026 solar return
    When I click "Timing Techniques" tab
    Then I should see planetary periods for the year
    And I should see:
      | Period      | Planet    | Dates        | Focus              |
      | Period 1    | Venus     | May 15 - Jun 28| Relationships     |
      | Period 2    | Mercury   | Jun 29 - Aug 4| Communication     |
      | Period 3    | Moon      | Aug 5 - Sep 3 | Emotions, home     |
    And I should see monthly profections
    And I should see solar return directions

  Scenario: Best and worst days for the solar year
    Given I am viewing my 2026 solar return
    When I click "Best & Worst Days"
    Then I should see highlighted favorable days
    And I should see highlighted challenging days
    And I should see:
      | Type      | Date        | Reason                          |
      | Best      | 2026-06-15  | Sun conjunct Jupiter            |
      | Best      | 2026-08-22  | Venus trine Saturn              |
      | Challenging| 2026-07-08 | Mars square Sun                 |
      | Challenging| 2026-09-30 | Saturn opposition Moon          |
    And I should see recommendations for each day

  Scenario: Compare with past solar return
    Given I have solar returns for 2025 and 2026
    When I click "Compare with Previous Year"
    Then I should see a side-by-side comparison
    And I should see what changed
    And I should see:
      | Element   | 2025             | 2026             |
      | Ascendant | 19° Capricorn    | 18° Cancer       |
      | Sun House | 2nd              | 11th             |
      | Theme     | Finances         | Social Goals     |
    And I should see the progression of themes
