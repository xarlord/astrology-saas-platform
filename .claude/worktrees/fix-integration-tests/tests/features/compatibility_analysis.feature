Feature: Compatibility Analysis
  As a user of the astrological platform
  I want to analyze astrological compatibility with others
  So that I can understand my relationships and interactions

  Background:
    Given the application is running
    And I am logged in as a registered user
    And I have a natal chart with:
      | Name       | John Doe           |
      | Birth Date | 1990-05-15         |
      | Sun Sign   | Taurus             |
      | Moon Sign  | Cancer             |
      | Venus Sign | Gemini             |
      | Mars Sign  | Aries              |

  Scenario: Compare with another user's chart
    Given I am on the "Compatibility" page
    And I have another person's chart with:
      | Name       | Jane Smith         |
      | Birth Date | 1988-08-22         |
      | Sun Sign   | Leo               |
      | Moon Sign  | Pisces            |
      | Venus Sign | Libra             |
      | Mars Sign  | Scorpio           |
    When I select "Compare Charts"
    And I select "Jane Smith" as the partner
    And I click "Analyze Compatibility"
    Then I should see a compatibility analysis
    And I should see an overall compatibility score
    And I should see comparisons by planet
    And I should see aspect analysis

  Scenario: View comprehensive compatibility score
    Given I have compared my chart with "Jane Smith"
    And I am viewing the compatibility results
    Then I should see an overall score between 0-100
    And I should see scores by category:
      | Category              | Score | Weight |
      | Sun Sign Compatibility | 75    | High   |
      | Moon Sign Compatibility| 60    | High   |
      | Venus Sign Compatibility| 85   | High   |
      | Mars Sign Compatibility| 50    | Medium |
      | Aspect Harmony        | 70    | High   |
      | Overall Score         | 68    | -      |
    And I should see the calculation methodology

  Scenario: View synastry aspects between charts
    Given I have compared my chart with "Jane Smith"
    And I am viewing the compatibility results
    When I click the "Synastry Aspects" tab
    Then I should see aspects between the two charts
    And I should see:
      | Partner 1 Planet | Partner 2 Planet | Aspect   | Meaning               |
      | John's Sun       | Jane's Moon      | Trine    | Emotional support     |
      | John's Venus     | Jane's Mars      | Square   | Tension in romance    |
      | John's Moon      | Jane's Sun       | Opposition| Understanding gaps  |
      | John's Mercury   | Jane's Mercury   | Conjunction| Mental connection  |
    And I should see the orb of each aspect
    And I should see positive and challenging aspects marked

  Scenario: View composite chart
    Given I have compared my chart with "Jane Smith"
    And I am viewing the compatibility results
    When I click the "Composite Chart" tab
    Then I should see a composite chart visualization
    And I should see the composite Sun sign
    And I should see the composite Moon sign
    And I should see the composite Venus sign
    And I should see the composite ascendant
    And I should see the relationship's purpose and theme

  Scenario: View relationship strengths
    Given I have compared my chart with "Jane Smith"
    And I am viewing the compatibility results
    Then I should see a "Strengths" section
    And I should see positive aspects:
      | Strength                  | Description                     |
      | Mental Connection         | Both Mercuries in compatible signs|
      | Shared Values             | Venus trine Saturn              |
      | Communication Ease        | Mercury conjunction             |
    And I should see how to leverage these strengths

  Scenario: View relationship challenges
    Given I have compared my chart with "Jane Smith"
    And I am viewing the compatibility results
    Then I should see a "Challenges" section
    And I should see challenging aspects:
      | Challenge                 | Description                     |
      | Emotional Differences     | Moon square Moon                |
      | Romantic Tension          | Venus square Mars               |
      | Communication Style       | Mercury square Mercury          |
    And I should see suggestions to overcome challenges

  Scenario: Compare romantic compatibility
    Given I am on the "Compatibility" page
    When I select "Romantic" as relationship type
    And I select my partner's chart
    And I click "Analyze Compatibility"
    Then I should see romantic-specific insights
    And I should see Venus sign compatibility
    And I should see Mars sign compatibility
    And I should see romantic potential score
    And I should see relationship timeline predictions
    And I should see love languages based on astrology

  Scenario: Compare business compatibility
    Given I am on the "Compatibility" page
    When I select "Business" as relationship type
    And I select my business partner's chart
    And I click "Analyze Compatibility"
    Then I should see business-specific insights
    And I should see career house comparisons
    And I should see work style compatibility
    And I should see potential for business success
    And I should see areas of cooperation and conflict

  Scenario: Compare friendship compatibility
    Given I am on the "Compatibility" page
    When I select "Friendship" as relationship type
    And I select my friend's chart
    And I click "Analyze Compatibility"
    Then I should see friendship-specific insights
    And I should see communication compatibility
    And I should see shared interests
    And I should see social style match
    And I should see long-term friendship potential

  Scenario: View compatibility over time
    Given I have compared my chart with "Jane Smith"
    And I am viewing the compatibility results
    When I click the "Timeline" tab
    Then I should see how compatibility changes over time
    And I should see upcoming transits affecting the relationship
    And I should see:
      | Date       | Transit                    | Effect          |
      | 2026-03-15 | Venus conjunct Composite Venus | Enhanced romance |
      | 2026-04-20 | Saturn square Composite Sun  | Relationship test|
    And I should see favorable periods for relationship growth

  Scenario: Save compatibility report
    Given I have analyzed compatibility with "Jane Smith"
    And I am viewing the results
    When I click "Save Report"
    And I enter a name "Relationship with Jane Smith"
    And I click "Save"
    Then the compatibility report should be saved
    And I should see it in my saved reports list
    And I should be able to access it later

  Scenario: Export compatibility analysis
    Given I have analyzed compatibility with "Jane Smith"
    And I am viewing the results
    When I click "Export"
    And I select "PDF" format
    And I select to include charts
    And I click "Download"
    Then a PDF should be downloaded
    And the PDF should contain both charts
    And the PDF should contain compatibility scores
    And the PDF should contain aspect interpretations

  Scenario Outline: Compatibility scores by sign combinations
    Given I am comparing two charts
    And Partner 1 has Sun in "<sign1>"
    And Partner 2 has Sun in "<sign2>"
    When the compatibility is calculated
    Then the Sun sign score should be "<score>"
    And the compatibility type should be "<type>"

    Examples:
      | sign1   | sign2   | score | type        |
      | Aries   | Leo     | 85    | Excellent   |
      | Aries   | Cancer  | 40    | Challenging |
      | Taurus  | Virgo   | 90    | Excellent   |
      | Gemini  | Sagittarius| 45  | Challenging |
      | Cancer  | Pisces  | 95    | Excellent   |
      | Leo     | Aquarius| 35    | Difficult   |
      | Virgo   | Capricorn| 88   | Excellent   |
      | Libra   | Libra   | 75    | Good        |
      | Scorpio  | Taurus  | 30    | Difficult   |
      | Sagittarius| Aries  | 85    | Excellent   |
      | Capricorn| Cancer | 35    | Difficult   |
      | Aquarius | Gemini | 80    | Very Good   |
      | Pisces   | Scorpio | 85    | Excellent   |

  Scenario: Compare multiple potential partners
    Given I have charts for multiple potential partners
    And I am on the "Compatibility" page
    When I select "Compare Multiple"
    And I select 3 partners to compare
    And I click "Analyze All"
    Then I should see a comparison table
    And I should see:
      | Partner    | Overall Score | Romantic | Business | Friendship |
      | Jane Smith | 68            | 72       | 65       | 75         |
      | Bob Jones  | 54            | 48       | 70       | 60         |
      | Alice Brown| 82            | 85       | 75       | 80         |
    And I should see rankings by category

  Scenario: View asteroid and minor planet compatibility
    Given I have compared my chart with "Jane Smith"
    And I am viewing detailed compatibility
    When I click "Minor Planets" tab
    Then I should see Chiron aspects
    And I should see Juno aspects (marriage asteroid)
    And I should see Vesta aspects
    And I should see Ceres aspects
    And I should see interpretations for each

  Scenario: View karmic connections
    Given I have compared my chart with "Jane Smith"
    And I am viewing the compatibility results
    When I click the "Karmic Analysis" tab
    Then I should see North Node connections
    And I should see Saturn aspects (karmic lessons)
    And I should see past life indicators
    And I should see karmic debt
    And I should see soul connection assessment

  Scenario: Get compatibility recommendations
    Given I have compared my chart with "Jane Smith"
    And I am viewing the compatibility results
    When I click the "Recommendations" tab
    Then I should see personalized advice
    And I should see activities to strengthen the relationship
    And I should see communication tips
    And I should see timing advice for important decisions
    And I should see growth opportunities for both partners
